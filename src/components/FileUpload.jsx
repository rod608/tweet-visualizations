import "./FileUpload.css";

import { Component } from "react";
import PropTypes from "prop-types";

class FileUpload extends Component {
  constructor(props) {
    super(props);
    this.state = {
      uploadedFile: null,
      data: null,
    };
  }

  handleFileSubmit = (event) => {
    event.preventDefault();
    const { uploadedFile } = this.state;

    if (uploadedFile) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const json = JSON.parse(e.target.result);
        this.setState({ data: json });
        this.props.setData(json);
      };

      reader.readAsText(uploadedFile);
    }
  };

  render() {
    return (
      <div style={{ backgroundColor: "#f0f0f0", marginBottom: "2rem", padding: 25 }}>
        <h2 style={{ marginBottom: "1rem" }}>Upload a JSON File</h2>

        <form onSubmit={this.handleFileSubmit}>
          <input
            type="file"
            accept=".json"
            onChange={(event) =>
              this.setState({ uploadedFile: event.target.files[0] })
            }
          />

          <button type="submit">Upload</button>
        </form>
      </div>
    );
  }
}

FileUpload.propTypes = {
  setData: PropTypes.func.isRequired,
};

export default FileUpload;
