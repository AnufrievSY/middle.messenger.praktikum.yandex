import EventBus from '../core/EventBus';
import type { AppEvents } from '../events';

const mediator = new EventBus<AppEvents>();

export default mediator;
