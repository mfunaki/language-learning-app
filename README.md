# Language Learning Web App

This repository contains a language learning web application that allows users to translate text, extract important words, and learn their definitions and example sentences using OpenAI's GPT-4 API. The app is built using Node.js and Express, with integration of OpenAI's API for language processing.

## Features

- **Text Translation**: Translate input text to a specified language.
- **Word Extraction**: Extract a list of important base words from the input text.
- **Definitions and Examples**: Provide concise definitions and example sentences for the extracted words.
- **Example Translations**: Example sentences are translated and displayed below the original examples.

## Technologies Used

- **Node.js & Express**: Backend server to handle API requests.
- **OpenAI API (GPT-4)**: For text translation, word extraction, and generation of definitions and example sentences.
- **HTML, CSS, JavaScript**: For the frontend user interface.

## Prerequisites

- **Node.js** (version 12 or higher)
- **npm** (Node Package Manager)
- **OpenAI API Key**: You need an API key from OpenAI to use their GPT-4 services.

## Installation

1. **Clone the repository**:
   ```bash
   git clone <repository_url>
   cd language-learning-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create a `.env` file** in the root directory and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Start the server**:
   ```bash
   node server.js
   ```

5. **Access the application**:
   Open your browser and navigate to [http://localhost:3000](http://localhost:3000).

## Project Structure

- **server.js**: Main server-side code that handles API requests and processes user input.
- **public/**: Contains static files such as the frontend HTML, CSS, and JavaScript.

## API Endpoints

- **POST /translate**: Accepts user input text and target language, and returns the translated text, extracted words, their definitions, example sentences, and translations.

## How to Use

1. Enter the text you want to translate in the text area (visible for 5 lines).
2. Select the target language from the dropdown.
3. Click on the "Translate" button to get the translated text, word list, definitions, and examples.
4. Each extracted word will be displayed with its definition, an example sentence, and a translated version of that example.

## Environment Variables

The application requires the following environment variable:
- **OPENAI_API_KEY**: Your API key for accessing OpenAI's GPT-4 API.

## Contributing

Feel free to open issues or submit pull requests for improvements or bug fixes. Contributions are always welcome!

## License

This project is licensed under the MIT License.

