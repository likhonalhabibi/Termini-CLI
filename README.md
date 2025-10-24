# Computer-Using Agent Project

This project contains a collection of scripts and a Dockerfile to demonstrate the capabilities of OpenAI's Computer-Using Agent (CUA).

## Directory Structure

*   `python/`: Contains a runnable Python implementation.
*   `javascript/`: Contains a runnable JavaScript implementation.
*   `Dockerfile`: A Dockerfile to set up a sandboxed environment for running the CUA.

## Python Usage

### Installation

1.  Navigate to the `python` directory:
    ```bash
    cd python
    ```
2.  Install the required dependencies:
    ```bash
    pip install -r requirements.txt
    ```
3.  Install the Playwright browsers:
    ```bash
    playwright install
    ```
4. Set your OpenAI API key as an environment variable:
    ```bash
    export OPENAI_API_KEY="your-api-key-here"
    ```

### Running the Agent

From the `python` directory, run the main script:
```bash
python main.py
```

## JavaScript Usage

### Installation

1.  Navigate to the `javascript` directory:
    ```bash
    cd javascript
    ```
2.  Install the required dependencies:
    ```bash
    npm install
    ```
3.  Install the Playwright browsers:
    ```bash
    npx playwright install
    ```
4. Set your OpenAI API key as an environment variable:
    ```bash
    export OPENAI_API_KEY="your-api-key-here"
    ```

### Running the Agent

From the `javascript` directory, run the main script:
```bash
npm start
```
