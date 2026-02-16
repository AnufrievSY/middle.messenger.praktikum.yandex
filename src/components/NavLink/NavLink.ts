import Block from '../../core/Block';
import { NavLinkProps } from './types';

export default class NavLink extends Block<NavLinkProps> {
  render(): HTMLElement {
    const template = `
            <a class="nav-link" href="{{href}}">{{label}}</a>
        `;
    return this.compile(template, {
      href: this.props.href,
      label: this.props.label,
    });
  }
}
