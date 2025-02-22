import { listarContainersEvent } from "./listarContainersEvent";
import { tinkerCommandEvent } from "./tinkerCommandEvent";

export function registerAllEvents() {
    tinkerCommandEvent();
    listarContainersEvent();

}