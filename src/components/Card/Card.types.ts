import type { CardProps as MuiCardProps } from '@mui/material/Card'
import type { CardActionsProps } from '@mui/material/CardActions'
import type { CardContentProps } from '@mui/material/CardContent'
import type { CardHeaderProps } from '@mui/material/CardHeader'
import type { CardMediaProps } from '@mui/material/CardMedia'
import type { TypographyProps } from '@mui/material/Typography'
import type { ReactNode } from 'react'

export interface CardImage {
  /** The image's URL. */
  src: string
  /**
   * Text for screen readers. `''` when the image is decorative, such as a
   * photo next to the product's name.
   */
  alt: string
  /**
   * The image's height, in pixels or any CSS length. Without it, the image
   * keeps its own height.
   */
  height?: number | string
}

export interface CardProps extends Omit<MuiCardProps, 'title' | 'children'> {
  /** The card's title, in the header. Replaces the HTML `title` attribute. */
  title?: ReactNode
  /** A line below the title, in `text.secondary`. */
  subheader?: ReactNode
  /** Shown before the title, such as an Avatar. */
  avatar?: ReactNode
  /** Shown at the end of the header, such as an icon button that opens a menu. */
  headerAction?: ReactNode
  /** An image at the top of the card, the full width of the card. */
  image?: CardImage
  /** The body, inside MUI's `CardContent` with its padding. */
  children?: ReactNode
  /** A row at the bottom, inside MUI's `CardActions`, such as Buttons. */
  actions?: ReactNode
  /** Props for inner parts. */
  slotProps?: {
    /** MUI's `CardHeader`. Only rendered with `title`, `subheader`, `avatar` or `headerAction`. */
    header?: Partial<Omit<CardHeaderProps, 'title' | 'subheader' | 'avatar' | 'action'>>
    /** The title's `Typography`. Pass `component: 'h3'` to make it a heading. */
    title?: Partial<TypographyProps>
    /** The subheader's `Typography`. */
    subheader?: Partial<TypographyProps>
    /** MUI's `CardMedia`, the `<img>`. Only rendered with `image`. */
    media?: Partial<CardMediaProps<'img'>>
    /** MUI's `CardContent`. Only rendered with `children`. */
    content?: Partial<CardContentProps>
    /** MUI's `CardActions`. Only rendered with `actions`. */
    actions?: Partial<CardActionsProps>
  }
}
