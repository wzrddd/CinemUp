import { HubConnection } from "@microsoft/signalr";

let connection: HubConnection | null = null;

export const setConnection = (conn: HubConnection) => {
    connection = conn;
};

export const getConnection = () => connection;
