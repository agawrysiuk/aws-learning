import {AuthService} from "./auth/auth.service";
import {MessageService} from "./messages/message.service";
import {InitService} from "./init/init.service";
import {ConnectionService} from "./connection/connection.service";

export const SERVICES_DECLARATIONS = [
    AuthService,
    MessageService,
    InitService,
    ConnectionService
];
