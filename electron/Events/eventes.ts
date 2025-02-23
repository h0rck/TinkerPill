import { listarContainersEvent } from "./listarContainersEvent";
import { setupLaravelScanner } from "./setupLaravelScanner";
import { tinkerCommandEvent } from "./tinkerCommandEvent";

export function registerAllEvents() {
    tinkerCommandEvent();
    listarContainersEvent();
    setupLaravelScanner();
}