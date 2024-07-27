import React from "react";
import {io} from "socket.io-client";

export const socket = io('/', {
    path: "/socket/",
    autoConnect: false
  });
export const SocketContext = React.createContext();