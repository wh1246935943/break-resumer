# Break-Resumer

Break-Resumer is a project designed to handle breakpoint resume and instant file upload (秒传) functionalities. It allows users to upload files efficiently by splitting them into chunks and ensuring that already uploaded parts are not re-uploaded, enhancing the speed and reliability of file uploads.

## Project Structure

```plaintext
BREAK-RESUMER/
├── .vscode/             # VS Code settings
├── node_modules/        # Node.js modules (managed by npm/yarn)
├── uploads/             # Directory where uploaded files are stored
├── web/                 # Frontend resources
│   ├── css/
│   │   └── style.css    # Stylesheet for the frontend
│   ├── js/
│   │   ├── createchunk.js  # Script for creating file chunks
│   │   ├── cutfile.js      # Script for handling file slicing
│   │   ├── loading.js      # Script for managing loading animations
│   │   ├── spark-md5.js    # Script for generating MD5 hash for file chunks
│   │   ├── worker.js       # Web worker script for offloading tasks
│   └── index.html       # Main HTML page for the frontend
├── .gitignore           # Git ignore file
├── file.js              # Server-side script for file handling
├── index.js             # Main server script
├── package.json         # Project dependencies and scripts
├── README.md            # Project documentation (this file)
├── util.js              # Utility functions for the project
├── yarn.lock            # Yarn lock file for dependency versions

```
## Getting Started

```
git clone https://github.com/your-username/break-resumer.git

cd break-resumer

npm install
or
yarn


npm start
or
yarn start

```

## The server will be running at http://localhost:3000

### The frontend page can be accessed at http://localhost:3000/web/index.html.





