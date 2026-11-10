import MuiCard from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import CardMedia from '@mui/material/CardMedia'
import type { CardProps } from './Card.types.ts'

/**
 * MUI's `Card`, with its header, image, content and actions put together from
 * props, in that order: the image, the header, the content, then the actions.
 * Each part is only rendered when its props are set.
 */
export function Card({
  title,
  subheader,
  avatar,
  headerAction,
  image,
  children,
  actions,
  slotProps = {},
  ...rootProps
}: CardProps) {
  const {
    header: headerProps,
    title: titleProps,
    subheader: subheaderProps,
    media: mediaProps,
    content: contentProps,
    actions: actionsProps,
  } = slotProps
  const hasHeader = title != null || subheader != null || avatar != null || headerAction != null

  return (
    <MuiCard {...rootProps}>
      {image && (
        <CardMedia
          component="img"
          image={image.src}
          alt={image.alt}
          {...mediaProps}
          // A style, not the `height` attribute, which only takes pixels.
          style={{ height: image.height, ...mediaProps?.style }}
        />
      )}
      {hasHeader && (
        <CardHeader
          {...headerProps}
          title={title}
          subheader={subheader}
          avatar={avatar}
          action={headerAction}
          slotProps={{
            ...headerProps?.slotProps,
            ...(titleProps && { title: titleProps }),
            ...(subheaderProps && { subheader: subheaderProps }),
          }}
        />
      )}
      {children != null && <CardContent {...contentProps}>{children}</CardContent>}
      {actions != null && <CardActions {...actionsProps}>{actions}</CardActions>}
    </MuiCard>
  )
}
