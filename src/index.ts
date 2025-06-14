import epxress, { type Request, type Response } from "express";
import cors from "cors";

const app = epxress();

app.use(epxress.json());
app.use(cors());

app.get("/", (req: Request, res: Response) => {
  res.json({ msg: "Test msg" });
});

app.listen(7000, () => {
  console.log("Listening on port 7000");
});
