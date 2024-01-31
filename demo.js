const newman = require("newman");
const fs = require("fs");

const loginJson = require("./scriptJson/login.json");
const postAPIJson = "./scriptJson/postAPI.json";
const jsonData = JSON.parse(fs.readFileSync(postAPIJson, "utf-8"));

newman.run(
  {
    collection: loginJson,
    environment: {
      variables: loginJson.variable,
    },
    reporters: ["allure"],
  },
  function (err, summary) {
    if (err) {
      throw err;
    }

    const token = JSON.parse(
      summary.run.executions[0].response.stream.toString()
    ).data.access;

    jsonData.variable = jsonData.variable.map((item) => {
      if (item.key == "token")
        return {
          ...item,
          value: token,
        };
      else return item;
    });

    fs.writeFileSync(postAPIJson, JSON.stringify(jsonData, null, 2));
  }
);

newman.run(
  {
    collection: postAPIJson,
    environment: {
      variables: postAPIJson.variable,
    },
    reporters: ["allure"],
  },
  function (err) {
    if (err) {
      throw err;
    }
  }
);
