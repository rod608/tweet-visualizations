import { Component } from "react";
import "./App.css";

import FileUpload from "./components/FileUpload.jsx";
import TweetVisualization from "./components/TweetVisualization.jsx";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      chartType: "Sentiment",
    };
  }

  setData = (data) => {
    const slicedData = data.slice(0, 300);
    this.setState({ data: slicedData });
  };

  setChartType = (type) => {
    this.setState({ chartType: type });
  };

  render() {
    const { data, chartType } = this.state;

    return (
      <div>
        <FileUpload setData={this.setData} id="fileUpload" />

        <label
          htmlFor="chartMenu"
          id="colorByLabel"
          style={{
            fontWeight: "bold",
            marginLeft: "2.5rem",
          }}
        >
          Color By:{" "}
        </label>

        <select
          name="chartMenu"
          id="chartMenu"
          onChange={e => this.setChartType(e.target.value)}
        >
          <option value="Sentiment">Sentiment</option>
          <option value="Subjectivity">Subjectivity</option>
        </select>

        <div className="parent">
          {data.length > 0 && (
            <TweetVisualization data={data} chartType={chartType} />
          )}
        </div>
      </div>
    );
  }
}

export default App;
