# 📚 WikiComic: Wikipedia Comics Generator

Welcome to **WikiComic**!  
This project lets you generate and explore comic stories based on Wikipedia articles, using a modern React frontend and a Flask backend.

---

## 🚀 Features

- 🦸‍♂️ Generate comic stories from Wikipedia articles
- 🎨 Choose comic styles and complexity
- 📖 Interactive, user-friendly web interface
- 🖼️ View and browse generated comics
- 🔒 Secure backend with API key support

---

## 🗂️ Project Structure

```
WikiComic/
├── wikicomic_flask/         # Flask backend
│   ├── app/
│   └── run.py
├── wikicomic_react/         # React frontend
│   ├── client/
│   └── server/
├── requirements.txt         # Python dependencies
└── README.md                # This file!
```

---

## 🛠️ Prerequisites

- **Python 3.8+** 🐍
- **Node.js 14+ & npm** 🟩
- **Git** (for cloning)

---

## 1️⃣ Backend Setup (Flask)

### 1. Clone the repository

```bash
git clone <repository-url>
cd WikiComic
```

### 2. Create a Python virtual environment

```bash
python3 -m venv wikienv
source wikienv/bin/activate   # On Windows: wikienv\Scripts\activate
```

### 3. Install Python dependencies

```bash
pip install -r requirements.txt
```

### 4. Set up environment variables

Create a `.env` file in `wikicomic_flask/` (or project root) and add your keys:

```
SECRET_KEY=your_secret_key
GROQ_API_KEY=your_groq_api_key
HF_TOKEN=your_huggingface_token
GOOGLE_API_KEY=your_google_api_key
DATABASE_URL=sqlite:///wikicomic.db
```

> ⚠️ **Note:** Only add the keys you need. The app will use defaults if not set.

### 5. Run the Flask backend

```bash
cd wikicomic_flask
python run.py
```

- The backend will be available at: [http://localhost:5000](http://localhost:5000)

---

## 2️⃣ Frontend Setup (React)

### 1. Install dependencies

```bash
cd ../wikicomic_react/client
npm install
```

### 2. Start the React development server

```bash
npm start
```

- The frontend will be available at: [http://localhost:3000](http://localhost:3000)

---

## 3️⃣ (Optional) Node.js Server (API Proxy or SSR)

If you have a custom Node.js backend in `wikicomic_react/server/`, install and run it:

```bash
cd ../server
npm install
npm start
```

---

## 🧪 Running Tests

- **Frontend:**  
  ```bash
  npm test
  ```
- **Backend:**  
  Add your tests in `wikicomic_flask/app/tests/` and run with `pytest` or your preferred tool.

---

## 🧹 Useful Commands

- **Deactivate Python venv:**  
  ```bash
  deactivate
  ```
- **Reinstall Node modules:**  
  ```bash
  rm -rf node_modules
  npm install
  ```
- **Rebuild frontend:**  
  ```bash
  npm run build
  ```

---

## 📝 Contributing

Contributions are welcome!  
Open an issue or submit a pull request for improvements or bug fixes.

---

## 📄 License

This project is licensed under the MIT License.

---

## 💡 Troubleshooting

- If you see errors about missing packages, double-check you are in the correct directory and have run the install commands.
- For CORS/API issues, ensure both frontend and backend are running and accessible.
- For environment variable errors, check your `.env` file and restart the backend.

---

## 🙋‍♂️ Need Help?

Open an issue on GitHub or contact the maintainer.

---

**Happy comic-making!** 🎉🦸‍♀️📚