import mediator from "../mediator/AppMediator";
import SettingsService, { SettingsData } from "../services/settingsService";

export default class SettingsController {
    private service: SettingsService;

    constructor(service: SettingsService) {
        this.service = service;
        mediator.on("settings:update", this.handleUpdate.bind(this));
    }

    private handleUpdate(data: SettingsData): void {
        this.service.updateProfile(data);
    }
}
