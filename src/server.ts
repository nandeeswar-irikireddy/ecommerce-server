import {configDotenv} from "dotenv"
configDotenv()

import app from "./app"

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`server listening at port ${port}`)
})