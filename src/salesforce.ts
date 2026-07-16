import { Connection } from "jsforce";
import "dotenv/config";

export function connectSalesforce(): Connection {

    return new Connection({

        instanceUrl: process.env.SF_INSTANCE_URL,

        accessToken: process.env.SF_ACCESS_TOKEN

    });

}