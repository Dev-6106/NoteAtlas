import { Agenda } from "agenda";
import { env } from "@/config/env";

const agenda = new Agenda({
  db: {
    address: env.DB_URL,
    collection: "jobs",
  },
});

export default agenda;