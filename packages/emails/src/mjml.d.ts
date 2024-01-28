export {};

declare module 'solid-js' {
  namespace JSX {
    interface MjmlMjmlAttributes {
      /** if set to "desktop", switch force desktop version for older (self-hosted) version of Outlook.com that doesn't support media queries (cf. this issue) (default = none) */
      owa?: string /* string */;
      /** used as <html lang=""> attribute (default = und) */
      lang?: string /* string */;
      /** used as <html dir=""> attribute (default = auto) */
      dir?: string /* string */;
      /** Children */
      children?: JSX.Element /* JSX.Element */;
    }

    interface MjmlHeadAttributes {
      /** Children */
      children?: JSX.Element /* JSX.Element */;
    }

    interface MjmlBodyAttributes {
      /** the general background color */
      'background-color'?: string /* color formats */;
      /** class name, added to the root HTML element created */
      'css-class'?: string /* string */;
      /** email's width (default = 600px) */
      width?: string /* px */;
      /** Children */
      children?: JSX.Element /* JSX.Element */;
    }

    interface MjmlIncludeAttributes {
      /** file path */
      path?: string /* string */;
      /** file type */
      type?: string /* string */;
      /** css inline */
      'css-inline'?: string /* string */;
      /** Children */
      children?: JSX.Element /* JSX.Element */;
    }

    interface MjmlAttributesAttributes {
      /** Children */
      children?: JSX.Element /* JSX.Element */;
    }

    interface MjmlAllAttributes {
      /** Attributes */
      [key: string]: any /* Any */;
      /** Children */
      children?: JSX.Element /* JSX.Element */;
    }

    interface MjmlClassAttributes {
      /** Attributes */
      [key: string]: any /* Any */;
      /** Children */
      children?: JSX.Element /* JSX.Element */;
    }

    interface MjmlBreakpointAttributes {
      /** breakpoint's value */
      width?: string /* px */;
      /** Children */
      children?: JSX.Element /* JSX.Element */;
    }

    interface MjmlFontAttributes {
      /** URL of a hosted CSS file */
      href?: string /* string */;
      /** name of the font */
      name?: string /* string */;
      /** Children */
      children?: JSX.Element /* JSX.Element */;
    }

    interface MjmlHtmlAttributesAttributes {
      /** Children */
      children?: JSX.Element /* JSX.Element */;
    }

    interface MjmlPreviewAttributes {
      /** Children */
      children?: JSX.Element /* JSX.Element */;
    }

    interface MjmlStyleAttributes {
      /** set to "inline" to inline styles */
      inline?: string /* string */;
      /** Children */
      children?: JSX.Element /* JSX.Element */;
    }

    interface MjmlTitleAttributes {
      /** Children */
      children?: JSX.Element /* JSX.Element */;
    }

    interface MjmlAccordionAttributes {
      /** CSS border format (default = 2px solid black) */
      border?: string /* string */;
      /** background-color of the cell */
      'container-background-color'?: string /* n/a */;
      /** class name, added to the root HTML element created */
      'css-class'?: string /* string */;
      /** font (default = Ubuntu, Helvetica, Arial, sans-serif) */
      'font-family'?: string /* n/a */;
      /** icon alignment (default = middle) */
      'icon-align'?: string /* n/a */;
      /** icon width (default = 32px) */
      'icon-height'?: string /* px */;
      /** display icon left or right (default = right) */
      'icon-position'?: string /* n/a */;
      /** alt text when accordion is unwrapped (default = -) */
      'icon-unwrapped-alt'?: string /* n/a */;
      /** icon when accordion is unwrapped (default = https://i.imgur.com/w4uTygT.png) */
      'icon-unwrapped-url'?: string /* n/a */;
      /** icon height (default = 32px) */
      'icon-width'?: string /* px */;
      /** alt text when accordion is wrapped (default = +) */
      'icon-wrapped-alt'?: string /* n/a */;
      /** icon when accordion is wrapped (default = https://i.imgur.com/bIXv1bk.png) */
      'icon-wrapped-url'?: string /* n/a */;
      /** padding (default = 10px 25px) */
      padding?: string /* px */;
      /** padding bottom */
      'padding-bottom'?: string /* px */;
      /** padding left */
      'padding-left'?: string /* px */;
      /** padding right */
      'padding-right'?: string /* px */;
      /** padding top */
      'padding-top'?: string /* px */;
      /** Children */
      children?: JSX.Element /* JSX.Element */;
    }

    interface MjmlAccordionElementAttributes {
      /** background color */
      'background-color'?: string /* n/a */;
      /** border (default = affects each horizontal border in the accordion except the top one) */
      border?: string /* n/a */;
      /** class name, added to the root HTML element created */
      'css-class'?: string /* string */;
      /** font (default = Ubuntu, Helvetica, Arial, sans-serif) */
      'font-family'?: string /* n/a */;
      /** icon alignment (default = middle) */
      'icon-align'?: string /* n/a */;
      /** icon width (default = 32px) */
      'icon-height'?: string /* n/a */;
      /** display icon left or right (default = right) */
      'icon-position'?: string /* n/a */;
      /** alt text when accordion is unwrapped (default = -) */
      'icon-unwrapped-alt'?: string /* n/a */;
      /** icon when accordion is unwrapped (default = https://i.imgur.com/w4uTygT.png) */
      'icon-unwrapped-url'?: string /* n/a */;
      /** icon height (default = 32px) */
      'icon-width'?: string /* n/a */;
      /** alt text when accordion is wrapped (default = +) */
      'icon-wrapped-alt'?: string /* n/a */;
      /** icon when accordion is wrapped (default = https://i.imgur.com/bIXv1bk.png) */
      'icon-wrapped-url'?: string /* n/a */;
      /** Children */
      children?: JSX.Element /* JSX.Element */;
    }

    interface MjmlAccordionTitleAttributes {
      /** background color */
      'background-color'?: string /* n/a */;
      /** text color */
      color?: string /* n/a */;
      /** class name, added to the root HTML element created */
      'css-class'?: string /* string */;
      /** font family (default = Ubuntu, Helvetica, Arial, sans-serif) */
      'font-family'?: string /* n/a */;
      /** font size (default = 13px) */
      'font-size'?: string /* px */;
      /** padding (default = 16px) */
      padding?: string /* px */;
      /** padding bottom */
      'padding-bottom'?: string /* px */;
      /** padding left */
      'padding-left'?: string /* px */;
      /** padding right */
      'padding-right'?: string /* px */;
      /** padding top */
      'padding-top'?: string /* px */;
      /** Children */
      children?: JSX.Element /* JSX.Element */;
    }

    interface MjmlAccordionTextAttributes {
      /** background color */
      'background-color'?: string /* n/a */;
      /** text color */
      color?: string /* n/a */;
      /** class name, added to the root HTML element created */
      'css-class'?: string /* string */;
      /** font family (default = Ubuntu, Helvetica, Arial, sans-serif) */
      'font-family'?: string /* n/a */;
      /** font size (default = 13px) */
      'font-size'?: string /* px */;
      /** text thickness */
      'font-weight'?: string /* number */;
      /** letter spacing (default = none) */
      'letter-spacing'?: string /* px,em */;
      /** space between the lines (default = 1) */
      'line-height'?: string /* px */;
      /** padding (default = 16px) */
      padding?: string /* px */;
      /** padding bottom */
      'padding-bottom'?: string /* px */;
      /** padding left */
      'padding-left'?: string /* px */;
      /** padding right */
      'padding-right'?: string /* px */;
      /** padding top */
      'padding-top'?: string /* px */;
      /** Children */
      children?: JSX.Element /* JSX.Element */;
    }

    interface MjmlButtonAttributes {
      /** horizontal alignment (default = center) */
      align?: string /* string */;
      /** button background-color (default = #414141) */
      'background-color'?: string /* color */;
      /** css border format (default = none) */
      border?: string /* string */;
      /** css border format */
      'border-bottom'?: string /* string */;
      /** css border format */
      'border-left'?: string /* string */;
      /** border radius (default = 3px) */
      'border-radius'?: string /* px */;
      /** css border format */
      'border-right'?: string /* string */;
      /** css border format */
      'border-top'?: string /* string */;
      /** text color (default = #ffffff) */
      color?: string /* color */;
      /** button container background color */
      'container-background-color'?: string /* color */;
      /** class name, added to the root HTML element created */
      'css-class'?: string /* string */;
      /** font name (default = Ubuntu, Helvetica, Arial, sans-serif) */
      'font-family'?: string /* string */;
      /** text size (default = 13px) */
      'font-size'?: string /* px */;
      /** normal/italic/oblique */
      'font-style'?: string /* string */;
      /** text thickness (default = normal) */
      'font-weight'?: string /* number */;
      /** button height */
      height?: string /* px */;
      /** link to be triggered when the button is clicked */
      href?: string /* link */;
      /** inner button padding (default = 10px 25px) */
      'inner-padding'?: string /* px */;
      /** letter-spacing */
      'letter-spacing'?: string /* px,em */;
      /** line-height on link (default = 120%) */
      'line-height'?: string /* px/%/none */;
      /** supports up to 4 parameters (default = 10px 25px) */
      padding?: string /* px */;
      /** bottom offset */
      'padding-bottom'?: string /* px */;
      /** left offset */
      'padding-left'?: string /* px */;
      /** right offset */
      'padding-right'?: string /* px */;
      /** top offset */
      'padding-top'?: string /* px */;
      /** specify the rel attribute for the button link */
      rel?: string /* string */;
      /** specify the target attribute for the button link (default = _blank) */
      target?: string /* string */;
      /** text-align button content (default = none) */
      'text-align'?: string /* string */;
      /** underline/overline/none (default = none) */
      'text-decoration'?: string /* string */;
      /** capitalize/uppercase/lowercase (default = none) */
      'text-transform'?: string /* string */;
      /** tooltip & accessibility */
      title?: string /* string */;
      /** vertical alignment (default = middle) */
      'vertical-align'?: string /* string */;
      /** button width */
      width?: string /* px */;
      /** Children */
      children?: JSX.Element /* JSX.Element */;
    }

    interface MjmlCarouselAttributes {
      /** horizontal alignment (default = center) */
      align?: string /* string */;
      /** column background color (default = none) */
      'container-background-color'?: string /* string */;
      /** border radius */
      'border-radius'?: string /* px */;
      /** class name, added to the root HTML element created */
      'css-class'?: string /* string */;
      /** width of the icons on left and right of the main image (default = 44px) */
      'icon-width'?: string /* px */;
      /** icon on the left of the main image (default = https://i.imgur.com/xTh3hln.png) */
      'left-icon'?: string /* url */;
      /** icon on the right of the main image (default = https://i.imgur.com/os7o9kz.png) */
      'right-icon'?: string /* url */;
      /** border of the thumbnails (default = none) */
      'tb-border'?: string /* css border format */;
      /** border-radius of the thumbnails (default = none) */
      'tb-border-radius'?: string /* px */;
      /** css border color of the hovered thumbnail (default = none) */
      'tb-hover-border-color'?: string /* string */;
      /** css border color of the selected thumbnail (default = none) */
      'tb-selected-border-color'?: string /* string */;
      /** thumbnail width (default = null) */
      'tb-width'?: string /* px */;
      /** display or not the thumbnails (visible (default = hidden)) */
      thumbnails?: string /* String */;
      /** Children */
      children?: JSX.Element /* JSX.Element */;
    }

    interface MjmlCarouselImageAttributes {
      /** image description (default = '') */
      alt?: string /* string */;
      /** class name, added to the root HTML element created */
      'css-class'?: string /* string */;
      /** link to redirect to on click */
      href?: string /* url */;
      /** specify the rel attribute */
      rel?: string /* string */;
      /** image source */
      src?: string /* url */;
      /** link target on click (default = _blank) */
      target?: string /* string */;
      /** image source to have a thumbnail different than the image it's linked to (default = null) */
      'thumbnails-src'?: string /* url */;
      /** tooltip & accessibility */
      title?: string /* string */;
      /** Children */
      children?: JSX.Element /* JSX.Element */;
    }

    interface MjmlColumnAttributes {
      /** background color for a column */
      'background-color'?: string /* color */;
      /** requires: a padding, inner background color for column */
      'inner-background-color'?: string /* color */;
      /** css border format (default = none) */
      border?: string /* string */;
      /** css border format */
      'border-bottom'?: string /* string */;
      /** css border format */
      'border-left'?: string /* string */;
      /** css border format */
      'border-right'?: string /* string */;
      /** css border format */
      'border-top'?: string /* string */;
      /** border radius */
      'border-radius'?: string /* percent/px */;
      /** css border format */
      'inner-border'?: string /* string */;
      /** css border format ; requires a padding */
      'inner-border-bottom'?: string /* string */;
      /** css border format ; requires a padding */
      'inner-border-left'?: string /* string */;
      /** css border format ; requires a padding */
      'inner-border-right'?: string /* string */;
      /** css border format ; requires a padding */
      'inner-border-top'?: string /* string */;
      /** border radius ; requires a padding */
      'inner-border-radius'?: string /* percent/px */;
      /** column width (default = (100 / number of non-raw elements in section)%) */
      width?: string /* percent/px */;
      /** middle/top/bottom (note: middle works only when adjacent mj-column is also set to middle) (default = top) */
      'vertical-align'?: string /* string */;
      /** supports up to 4 parameters */
      padding?: string /* px */;
      /** section top offset */
      'padding-top'?: string /* px */;
      /** section bottom offset */
      'padding-bottom'?: string /* px */;
      /** section left offset */
      'padding-left'?: string /* px */;
      /** section right offset */
      'padding-right'?: string /* px */;
      /** class name, added to the root HTML element created */
      'css-class'?: string /* string */;
      /** Children */
      children?: JSX.Element /* JSX.Element */;
    }

    interface MjmlDividerAttributes {
      /** left/right/center (default = center) */
      align?: string /* string */;
      /** divider color (default = #000000) */
      'border-color'?: string /* color */;
      /** dashed/dotted/solid (default = solid) */
      'border-style'?: string /* string */;
      /** divider's border width (default = 4px) */
      'border-width'?: string /* px */;
      /** inner element background color */
      'container-background-color'?: string /* color */;
      /** class name, added to the root HTML element created */
      'css-class'?: string /* string */;
      /** supports up to 4 parameters (default = 10px 25px) */
      padding?: string /* px */;
      /** bottom offset */
      'padding-bottom'?: string /* px */;
      /** left offset */
      'padding-left'?: string /* px */;
      /** right offset */
      'padding-right'?: string /* px */;
      /** top offset */
      'padding-top'?: string /* px */;
      /** divider width (default = 100%) */
      width?: string /* px/percent */;
      /** Children */
      children?: JSX.Element /* JSX.Element */;
    }

    interface MjmlGroupAttributes {
      /** group width (default = (100 / number of non-raw elements in section)%) */
      width?: string /* percent/px */;
      /** middle/top/bottom (default = top) */
      'vertical-align'?: string /* string */;
      /** background color for a group */
      'background-color'?: string /* string */;
      /** set the display order of direct children (default = ltr) */
      direction?: string /* ltr / rtl */;
      /** class name, added to the root HTML element created */
      'css-class'?: string /* string */;
      /** Children */
      children?: JSX.Element /* JSX.Element */;
    }

    interface MjmlHeroAttributes {
      /** hero background color (default = #ffffff) */
      'background-color'?: string /* color */;
      /** height of the image used, mandatory (default = none) */
      'background-height'?: string /* px */;
      /** background image position (default = center center) */
      'background-position'?: string /* top/center/bottom left/center/right */;
      /** absolute background url */
      'background-url'?: string /* url */;
      /** width of the image used, mandatory (default = parent element width) */
      'background-width'?: string /* px */;
      /** border radius */
      'border-radius'?: string /* px */;
      /** hero section height (required for fixed-height mode) (default = 0px) */
      height?: string /* px */;
      /** choose if the height is fixed based on the height attribute or fluid (default = fluid-height) */
      mode?: string /* fluid-height/fixed-height */;
      /** supports up to 4 parameters (default = 0px) */
      padding?: string /* px */;
      /** bottom offset (default = 0px) */
      'padding-bottom'?: string /* px */;
      /** left offset (default = 0px) */
      'padding-left'?: string /* px */;
      /** right offset (default = 0px) */
      'padding-right'?: string /* px */;
      /** top offset (default = 0px) */
      'padding-top'?: string /* px */;
      /** content vertical alignment (default = top) */
      'vertical-align'?: string /* top/middle/bottom */;
      /** Children */
      children?: JSX.Element /* JSX.Element */;
    }

    interface MjmlImageAttributes {
      /** image alignment (default = center) */
      align?: string /* position */;
      /** image description (default = '') */
      alt?: string /* string */;
      /** css border definition (default = none) */
      border?: string /* string */;
      /** css border definition (default = none) */
      'border-top'?: string /* string */;
      /** css border definition (default = none) */
      'border-bottom'?: string /* string */;
      /** css border definition (default = none) */
      'border-left'?: string /* string */;
      /** css border definition (default = none) */
      'border-right'?: string /* string */;
      /** border radius */
      'border-radius'?: string /* px */;
      /** inner element background color */
      'container-background-color'?: string /* color */;
      /** class name, added to the root HTML element created */
      'css-class'?: string /* string */;
      /** if "true", will be full width on mobile even if width is set */
      'fluid-on-mobile'?: string /* string */;
      /** image height (default = auto) */
      height?: string /* px */;
      /** link to redirect to on click */
      href?: string /* url */;
      /** specify the link name attribute */
      name?: string /* string */;
      /** supports up to 4 parameters (default = 10px 25px) */
      padding?: string /* px */;
      /** bottom offset */
      'padding-bottom'?: string /* px */;
      /** left offset */
      'padding-left'?: string /* px */;
      /** right offset */
      'padding-right'?: string /* px */;
      /** top offset */
      'padding-top'?: string /* px */;
      /** specify the rel attribute */
      rel?: string /* string */;
      /** set width based on query */
      sizes?: string /* media query & width */;
      /** image source */
      src?: string /* url */;
      /** enables to set a different image source based on the viewport */
      srcset?: string /* url & width */;
      /** link target on click (default = _blank) */
      target?: string /* string */;
      /** tooltip & accessibility */
      title?: string /* string */;
      /** reference to image map, be careful, it isn't supported everywhere */
      usemap?: string /* string */;
      /** image width (default = parent width) */
      width?: string /* px */;
      /** Children */
      children?: JSX.Element /* JSX.Element */;
    }

    interface MjmlNavbarAttributes {
      /** align content left/center/right (default = center) */
      align?: string /* string */;
      /** base url for children components */
      'base-url'?: string /* string */;
      /** class name, added to the root HTML element created */
      'css-class'?: string /* string */;
      /** activate the hamburger navigation on mobile if the value is hamburger */
      hamburger?: string /* string */;
      /** hamburger icon alignment, left/center/right (hamburger mode required) (default = center) */
      'ico-align'?: string /* string */;
      /** char code for a custom close icon (hamburger mode required) (default = 8855) */
      'ico-close'?: string /* ASCII code decimal */;
      /** hamburger icon color (hamburger mode required) (default = #000000) */
      'ico-color'?: string /* color format */;
      /** hamburger icon font (only on hamburger mode) (default = Ubuntu, Helvetica, Arial, sans-serif) */
      'ico-font-family'?: string /* string */;
      /** hamburger icon size (hamburger mode required) (default = 30px) */
      'ico-font-size'?: string /* px */;
      /** hamburger icon line height (hamburger mode required) (default = 30px) */
      'ico-line-height'?: string /* px */;
      /** char code for a custom open icon (hamburger mode required) (default = 9776) */
      'ico-open'?: string /* ASCII code decimal */;
      /** hamburger icon padding, supports up to 4 parameters (hamburger mode required) (default = 10px) */
      'ico-padding'?: string /* px */;
      /** hamburger icon bottom offset (hamburger mode required) (default = 10px) */
      'ico-padding-bottom'?: string /* px */;
      /** hamburger icon left offset (hamburger mode required) (default = 10px) */
      'ico-padding-left'?: string /* px */;
      /** hamburger icon right offset (hamburger mode required) (default = 10px) */
      'ico-padding-right'?: string /* px */;
      /** hamburger icon top offset (hamburger mode required) (default = 10px) */
      'ico-padding-top'?: string /* px */;
      /** hamburger icon text decoration none/underline/overline/line-through (hamburger mode required) (default = none) */
      'ico-text-decoration'?: string /* string */;
      /** hamburger icon text transformation none/capitalize/uppercase/lowercase (hamburger mode required) (default = none) */
      'ico-text-transform'?: string /* string */;
      /** Children */
      children?: JSX.Element /* JSX.Element */;
    }

    interface MjmlNavbarLinkAttributes {
      /** text color (default = #000000) */
      color?: string /* color */;
      /** class name, added to the root HTML element created */
      'css-class'?: string /* string */;
      /** font (default = Ubuntu, Helvetica, Arial, sans-serif) */
      'font-family'?: string /* string */;
      /** text size (default = 13px) */
      'font-size'?: string /* px */;
      /** normal/italic/oblique */
      'font-style'?: string /* string */;
      /** text thickness */
      'font-weight'?: string /* number */;
      /** link to redirect to on click */
      href?: string /* string */;
      /** letter-spacing */
      'letter-spacing'?: string /* px,em */;
      /** space between the lines (default = 22px) */
      'line-height'?: string /* px */;
      /** supports up to 4 parameters (default = 15px 10px) */
      padding?: string /* px */;
      /** bottom offset */
      'padding-bottom'?: string /* px */;
      /** left offset */
      'padding-left'?: string /* px */;
      /** right offset */
      'padding-right'?: string /* px */;
      /** top offset */
      'padding-top'?: string /* px */;
      /** specify the rel attribute */
      rel?: string /* string */;
      /** link target on click */
      target?: string /* string */;
      /** underline/overline/none */
      'text-decoration'?: string /* string */;
      /** capitalize/uppercase/lowercase/none (default = uppercase) */
      'text-transform'?: string /* string */;
      /** Children */
      children?: JSX.Element /* JSX.Element */;
    }

    interface MjmlRawAttributes {
      /** Children */
      children?: JSX.Element /* JSX.Element */;
    }

    interface MjmlSectionAttributes {
      /** section color */
      'background-color'?: string /* color */;
      /** css background position (see outlook limitations below) (default = top center) */
      'background-position'?: string /* percent / 'left','top',... (2 values max) */;
      /** css background position x (default = none) */
      'background-position-x'?: string /* percent / keyword */;
      /** css background position y (default = none) */
      'background-position-y'?: string /* percent / keyword */;
      /** css background repeat (default = repeat) */
      'background-repeat'?: string /* string */;
      /** css background size (default = auto) */
      'background-size'?: string /* px/percent/'cover'/'contain' */;
      /** background url */
      'background-url'?: string /* url */;
      /** css border format (default = none) */
      border?: string /* string */;
      /** css border format */
      'border-bottom'?: string /* string */;
      /** css border format */
      'border-left'?: string /* string */;
      /** border radius */
      'border-radius'?: string /* px */;
      /** css border format */
      'border-right'?: string /* string */;
      /** css border format */
      'border-top'?: string /* string */;
      /** class name, added to the root HTML element created */
      'css-class'?: string /* string */;
      /** set the display order of direct children (default = ltr) */
      direction?: string /* ltr / rtl */;
      /** make the section full-width */
      'full-width'?: string /* string */;
      /** supports up to 4 parameters (default = 20px 0) */
      padding?: string /* px */;
      /** section bottom offset */
      'padding-bottom'?: string /* px */;
      /** section left offset */
      'padding-left'?: string /* px */;
      /** section right offset */
      'padding-right'?: string /* px */;
      /** section top offset */
      'padding-top'?: string /* px */;
      /** css text-align (default = center) */
      'text-align'?: string /* string */;
      /** Children */
      children?: JSX.Element /* JSX.Element */;
    }

    interface MjmlSocialAttributes {
      /** left/right/center (default = center) */
      align?: string /* string */;
      /** border radius (default = 3px) */
      'border-radius'?: string /* px */;
      /** text color (default = #333333) */
      color?: string /* color */;
      /** class name, added to the root HTML element created */
      'css-class'?: string /* string */;
      /** inner element background color */
      'container-background-color'?: string /* color */;
      /** font name (default = Ubuntu, Helvetica, Arial, sans-serif) */
      'font-family'?: string /* string */;
      /** font size (default = 13px) */
      'font-size'?: string /* px/em */;
      /** font style (default = normal) */
      'font-style'?: string /* string */;
      /** font weight (default = normal) */
      'font-weight'?: string /* string */;
      /** icon height, overrides icon-size (default = icon-size) */
      'icon-height'?: string /* percent/px */;
      /** icon size (width and height) (default = 20px) */
      'icon-size'?: string /* percent/px */;
      /** social network surrounding padding (default = 4px) */
      'inner-padding'?: string /* px */;
      /** space between lines (default = 22px) */
      'line-height'?: string /* percent/px */;
      /** vertical/horizontal (default = horizontal) */
      mode?: string /* string */;
      /** supports up to 4 parameters (default = 10px 25px) */
      padding?: string /* px */;
      /** bottom offset */
      'padding-bottom'?: string /* px */;
      /** left offset */
      'padding-left'?: string /* px */;
      /** right offset */
      'padding-right'?: string /* px */;
      /** top offset */
      'padding-top'?: string /* px */;
      /** padding around the icons (default = 0px) */
      'icon-padding'?: string /* px */;
      /** padding around the texts (default = 4px 4px 4px 0) */
      'text-padding'?: string /* px */;
      /** underline/overline/none (default = none) */
      'text-decoration'?: string /* string */;
      /** Children */
      children?: JSX.Element /* JSX.Element */;
    }

    interface MjmlSocialElementAttributes {
      /** left/right/center (default = center) */
      align?: string /* string */;
      /** image alt attribute (default = '') */
      alt?: string /* string */;
      /** icon color (default = Each social name has its own default) */
      'background-color'?: string /* color */;
      /** border radius (default = 3px) */
      'border-radius'?: string /* px */;
      /** text color (default = #333333) */
      color?: string /* color */;
      /** class name, added to the root HTML element created */
      'css-class'?: string /* string */;
      /** font name (default = Ubuntu, Helvetica, Arial, sans-serif) */
      'font-family'?: string /* string */;
      /** font size (default = 13px) */
      'font-size'?: string /* px/em */;
      /** font style (default = normal) */
      'font-style'?: string /* string */;
      /** font weight (default = normal) */
      'font-weight'?: string /* string */;
      /** button redirection url (default = none) */
      href?: string /* url */;
      /** icon height, overrides icon-size (default = icon-size) */
      'icon-height'?: string /* percent/px */;
      /** icon size (width and height) (default = 20px) */
      'icon-size'?: string /* percent/px */;
      /** space between lines (default = 22px) */
      'line-height'?: string /* percent/px */;
      /** social network name, see supported list below (default = N/A) */
      name?: string /* string */;
      /** supports up to 4 parameters (default = 4px) */
      padding?: string /* px */;
      /** bottom offset */
      'padding-bottom'?: string /* px */;
      /** left offset */
      'padding-left'?: string /* px */;
      /** right offset */
      'padding-right'?: string /* px */;
      /** top offset */
      'padding-top'?: string /* px */;
      /** padding around the icon (default = 0px) */
      'icon-padding'?: string /* px */;
      /** padding around the text (default = 4px 4px 4px 0) */
      'text-padding'?: string /* px */;
      /** set icon width based on query */
      sizes?: string /* media query & width */;
      /** image source (default = Each social name has its own default) */
      src?: string /* url */;
      /** set a different image source based on the viewport */
      srcset?: string /* url & width */;
      /** specify the rel attribute for the link */
      rel?: string /* string */;
      /** link target (default = _blank) */
      target?: string /* string */;
      /** img title attribute (default = none) */
      title?: string /* string */;
      /** underline/overline/none (default = none) */
      'text-decoration'?: string /* string */;
      /** top/middle/bottom (default = middle) */
      'vertical-align'?: string /* string */;
      /** Children */
      children?: JSX.Element /* JSX.Element */;
    }

    interface MjmlSpacerAttributes {
      /** inner element background color */
      'container-background-color'?: string /* color */;
      /** class name, added to the root HTML element created */
      'css-class'?: string /* string */;
      /** spacer height (default = 20px) */
      height?: string /* px */;
      /** supports up to 4 parameters (default = none) */
      padding?: string /* px */;
      /** bottom offset */
      'padding-bottom'?: string /* px */;
      /** left offset */
      'padding-left'?: string /* px */;
      /** right offset */
      'padding-right'?: string /* px */;
      /** top offset */
      'padding-top'?: string /* px */;
      /** Children */
      children?: JSX.Element /* JSX.Element */;
    }

    interface MjmlTableAttributes {
      /** self horizontal alignment (default = left) */
      align?: string /* left/right/center */;
      /** table external border (default = none) */
      border?: string /* border */;
      /** space between cells */
      cellpadding?: string /* pixels */;
      /** space between cell and border */
      cellspacing?: string /* pixels */;
      /** text header & footer color (default = #000000) */
      color?: string /* color */;
      /** inner element background color */
      'container-background-color'?: string /* color */;
      /** class name, added to the root HTML element created */
      'css-class'?: string /* string */;
      /** font name (default = Ubuntu, Helvetica, Arial, sans-serif) */
      'font-family'?: string /* string */;
      /** font size (default = 13px) */
      'font-size'?: string /* px */;
      /** space between lines (default = 22px) */
      'line-height'?: string /* percent/px */;
      /** supports up to 4 parameters (default = 10px 25px) */
      padding?: string /* percent/px */;
      /** bottom offset */
      'padding-bottom'?: string /* percent/px */;
      /** left offset */
      'padding-left'?: string /* percent/px */;
      /** right offset */
      'padding-right'?: string /* percent/px */;
      /** top offset */
      'padding-top'?: string /* percent/px */;
      /** specify the role attribute */
      role?: string /* none/presentation */;
      /** sets the table layout. (default = auto) */
      'table-layout'?: string /* auto/fixed/initial/inherit */;
      /** table width (default = 100%) */
      width?: string /* percent/px */;
      /** Children */
      children?: JSX.Element /* JSX.Element */;
    }

    interface MjmlTextAttributes {
      /** text color (default = #000000) */
      color?: string /* color */;
      /** font (default = Ubuntu, Helvetica, Arial, sans-serif) */
      'font-family'?: string /* string */;
      /** text size (default = 13px) */
      'font-size'?: string /* px */;
      /** normal/italic/oblique */
      'font-style'?: string /* string */;
      /** text thickness */
      'font-weight'?: string /* number */;
      /** space between the lines (default = 1) */
      'line-height'?: string /* px */;
      /** letter spacing (default = none) */
      'letter-spacing'?: string /* px,em */;
      /** The height of the element */
      height?: string /* px */;
      /** underline/overline/line-through/none */
      'text-decoration'?: string /* string */;
      /** uppercase/lowercase/capitalize */
      'text-transform'?: string /* string */;
      /** left/right/center/justify (default = left) */
      align?: string /* string */;
      /** inner element background color */
      'container-background-color'?: string /* color */;
      /** supports up to 4 parameters (default = 10px 25px) */
      padding?: string /* px */;
      /** top offset */
      'padding-top'?: string /* px */;
      /** bottom offset */
      'padding-bottom'?: string /* px */;
      /** left offset */
      'padding-left'?: string /* px */;
      /** right offset */
      'padding-right'?: string /* px */;
      /** class name, added to the root HTML element created */
      'css-class'?: string /* string */;
      /** Children */
      children?: JSX.Element /* JSX.Element */;
    }

    interface MjmlWrapperAttributes {
      /** section color */
      'background-color'?: string /* color */;
      /** css background position (see outlook limitations in mj-section doc) (default = top center) */
      'background-position'?: string /* percent / 'left','top',... (2 values max) */;
      /** css background position x (default = none) */
      'background-position-x'?: string /* percent / keyword */;
      /** css background position y (default = none) */
      'background-position-y'?: string /* percent / keyword */;
      /** css background repeat (default = repeat) */
      'background-repeat'?: string /* string */;
      /** css background size (default = auto) */
      'background-size'?: string /* px/percent/'cover'/'contain' */;
      /** background url */
      'background-url'?: string /* url */;
      /** css border format (default = none) */
      border?: string /* string */;
      /** css border format */
      'border-bottom'?: string /* string */;
      /** css border format */
      'border-left'?: string /* string */;
      /** border radius */
      'border-radius'?: string /* px */;
      /** css border format */
      'border-right'?: string /* string */;
      /** css border format */
      'border-top'?: string /* string */;
      /** class name, added to the root HTML element created */
      'css-class'?: string /* string */;
      /** make the wrapper full-width */
      'full-width'?: string /* string */;
      /** supports up to 4 parameters (default = 20px 0) */
      padding?: string /* px */;
      /** section bottom offset */
      'padding-bottom'?: string /* px */;
      /** section left offset */
      'padding-left'?: string /* px */;
      /** section right offset */
      'padding-right'?: string /* px */;
      /** section top offset */
      'padding-top'?: string /* px */;
      /** css text-align (default = center) */
      'text-align'?: string /* string */;
      /** Children */
      children?: JSX.Element /* JSX.Element */;
    }

    interface MjmlElementTags {
      mjml: MjmlMjmlAttributes;
      'mj-head': MjmlHeadAttributes;
      'mj-body': MjmlBodyAttributes;
      'mj-include': MjmlIncludeAttributes;
      'mj-attributes': MjmlAttributesAttributes;
      'mj-all': MjmlAllAttributes;
      'mj-class': MjmlClassAttributes;
      'mj-breakpoint': MjmlBreakpointAttributes;
      'mj-font': MjmlFontAttributes;
      'mj-html-attributes': MjmlHtmlAttributesAttributes;
      'mj-preview': MjmlPreviewAttributes;
      'mj-style': MjmlStyleAttributes;
      'mj-title': MjmlTitleAttributes;
      'mj-accordion': MjmlAccordionAttributes;
      'mj-accordion-element': MjmlAccordionElementAttributes;
      'mj-accordion-title': MjmlAccordionTitleAttributes;
      'mj-accordion-text': MjmlAccordionTextAttributes;
      'mj-button': MjmlButtonAttributes;
      'mj-carousel': MjmlCarouselAttributes;
      'mj-carousel-image': MjmlCarouselImageAttributes;
      'mj-column': MjmlColumnAttributes;
      'mj-divider': MjmlDividerAttributes;
      'mj-group': MjmlGroupAttributes;
      'mj-hero': MjmlHeroAttributes;
      'mj-image': MjmlImageAttributes;
      'mj-navbar': MjmlNavbarAttributes;
      'mj-navbar-link': MjmlNavbarLinkAttributes;
      'mj-raw': MjmlRawAttributes;
      'mj-section': MjmlSectionAttributes;
      'mj-social': MjmlSocialAttributes;
      'mj-social-element': MjmlSocialElementAttributes;
      'mj-spacer': MjmlSpacerAttributes;
      'mj-table': MjmlTableAttributes;
      'mj-text': MjmlTextAttributes;
      'mj-wrapper': MjmlWrapperAttributes;
    }

    interface IntrinsicElements extends MjmlElementTags {}
  }
}
