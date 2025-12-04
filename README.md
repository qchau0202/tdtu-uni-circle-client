UniCircle Frontend – Quick Setup
================================

Requirements
------------
- Node.js 18+ and npm

1. Install dependencies
-----------------------
From the `fe` folder:

```bash
cd fe
npm install
```

2. Start the Auth Service (backend)
-----------------------------------
In another terminal, go to the auth service and run:

```bash
cd ../be/auth_service
npm install
npm run dev
```

By default it runs on `http://localhost:3001`.

3. Configure the frontend
-------------------------
In the `fe` folder, create a `.env` file:

```env
VITE_AUTH_SERVICE_URL=http://localhost:3001/api/auth
```

4. Run the frontend
-------------------
From the `fe` folder:

```bash
npm run dev
```

Then open the URL shown in the terminal (usually `http://localhost:5173`).