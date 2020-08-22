import React from 'react'
import {useSelector, useDispatch} from 'react-redux'
import Typography from '@material-ui/core/Typography'
import {makeStyles} from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import {Masonry} from 'gestalt'
import clx from 'classnames'
import _ from 'lodash'

import {Link} from 'components/link'

const store = Masonry.createMeasurementStore()

const useStyles = makeStyles((theme) => ({
  root: {
    paddingBottom: theme.spacing(4),
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: theme.spacing(4),
  },
}))

const itemStyles = makeStyles((theme) => ({
  root: {
    paddingBottom: theme.spacing(2),
    paddingRight: theme.spacing(1),
    paddingLeft: theme.spacing(1),
  },
  media: {
    maxWidth: '100%',
    paddingTop: '175%',
    backgroundSize: 'cover',
  },
  mediaVideo: {
    paddingTop: 0,
    height: '100%',
  },
  ad: {
    paddingTop: '125%',
  },
  cardActions: {
    display: 'block',
  },
  cardContent: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    wordBreak: 'break-word',
  },
}))

export const FeedItem = ({data: item}) => {
  const classes = itemStyles()
  const {height, width, url} = item.thumbnail
  const dispatch = useDispatch()

  return (
    <div className={classes.root}>
      <Card>
        <CardActionArea>
          <Link to={`/item/${item.slug}`} block>
            {_.get(item, 'animation.url') && false ? (
              <CardMedia
                className={clx(classes.media, classes.mediaVideo)}
                component="video"
                src={_.get(item, 'animation.url')}
                autoPlay
              />
            ) : (
              <CardMedia className={classes.media} image={url} />
            )}
            <CardContent className={classes.cardContent}>
              <Typography
                color="textPrimary"
                gutterBottom
                variant="h6"
                component="h3"
              >
                {item.title}
              </Typography>
              <Typography
                color="textPrimary"
                gutterBottom
                variant="body2"
                component="p"
              >
                {item.description}
              </Typography>
            </CardContent>
          </Link>
        </CardActionArea>
        <CardActions className={classes.cardActions}>
          <Button
            size="small"
            color="primary"
            onClick={() => {
              dispatch({type: 'popups/openShareModal', video: item})
              // event('homefeed_share', {
              //   event_category: 'engagement',
              //   event_label: item.id,
              // })
            }}
          >
            Share
          </Button>
        </CardActions>
      </Card>
    </div>
  )
}

const IndexPage = function IndexPage(props) {
  const classes = useStyles()
  const dispatch = useDispatch()
  const search = useSelector((state) => state.search)
  const fetchingItem = useSelector((state) => state.item.fetching)
  const {items, fetching, columnWidth} = useSelector((state) => state.homepage)
  React.useEffect(() => {}, [search])

  if (fetchingItem) {
    return <div>fetching!</div>
  }

  return (
    <div className={classes.root}>
      <div></div>
      <Masonry
        comp={FeedItem}
        minCols={2}
        loadItems={() => null}
        layout="basic"
        items={items}
        scrollContainer={() => (process.env.SSR ? null : window)}
        virtualize={true}
        columnWidth={columnWidth}
        flexible
        measurementStore={store}
      />
      {fetching && (
        <div className={classes.loading}>
          <div>
            <CircularProgress color="inherit" size={40} />
          </div>
        </div>
      )}
    </div>
  )
}

export default IndexPage
