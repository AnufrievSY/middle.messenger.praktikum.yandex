import Block, { type BlockProps } from '../core/Block';

export default class BasePage<P extends BlockProps = BlockProps> extends Block<P> {}
