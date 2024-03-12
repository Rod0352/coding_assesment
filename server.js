// import dependencies and initialize the express app
import express from "express";
import fetch from "node-fetch";
const app = express();

// Define endpoint
app.get("/:formId/filteredResponses", async (req, res) => {
  try {
    // get filters and formId from request
    const formId = req.params.formId;
    const filters = JSON.parse(req.query.filters);

    const apiKey =
      "sk_prod_TfMbARhdgues5AuIosvvdAC9WsA5kXiZlW8HZPaRDlIbCpSpLsXBeZO7dCVZQwHAY3P4VSBPiiC33poZ1tdUj2ljOzdTCCOSpUZ_3912";

    const options = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    };
    // Fetch responses from Fillout API
    const response = await fetch(
      `https://api.fillout.com/v1/api/forms/${formId}/submissions`,
      options
    )
      .then((response) => response.json())
      .catch((error) => {
        console.error("Error fetching responses:", error);
        res.status(500).json({ error: "Internal Server Error" });
      });

    // Apply filters to responses
    const filteredResponses = response.responses?.filter((response) => {
      return filters.forEach((filter) => {
        // Find question in response via filter id
        const question = response.questions.find(
          (question) => question.id === filter.id
        );
        // If question is not found, return false
        if (!question) return false;

        switch (filter.condition) {
          case "equals":
            return question.value === filter.value;
          case "does_not_equal":
            return question.value !== filter.value;
          case "greater_than":
            return question.value > filter.value;
          case "less_than":
            return question.value < filter.value;
          default:
            return false;
        }
      });
    });

    // Paginate responses and send response
    const totalResponses = filteredResponses ? filteredResponses.length : 0;
    const pageCount = 1;

    res.json({
      responses: filteredResponses,
      totalResponses,
      pageCount,
    });
  } catch (error) {
    console.error("Error fetching or filtering responses:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start the server
app.listen(3000, () => {
  console.log(`Server is live on port 3000`);
});
