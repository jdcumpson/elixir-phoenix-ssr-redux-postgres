const DEFAULT_STATE = {
  items: [
    {
      title: 'Cherries',
      description: 'Wonderful late summer cherries!',
      thumbnail: {
        url:
          'https://burst.shopifycdn.com/photos/bowl-of-red-cherries-on-a-white-background.jpg?width=925&format=pjpg&exif=1&iptc=1',
        width: 467,
        height: 700,
      },
    },
    {
      title: 'Cherries',
      description: 'Wonderful late summer cherries!',
      thumbnail: {
        url:
          'https://burst.shopifycdn.com/photos/bowl-of-red-cherries-on-a-white-background.jpg?width=925&format=pjpg&exif=1&iptc=1',
        width: 467,
        height: 700,
      },
    },
    {
      title: 'Foo',
      description: 'Wonderful late summer cherries!',
      thumbnail: {
        url:
          'https://burst.shopifycdn.com/photos/bowl-of-red-cherries-on-a-white-background.jpg?width=925&format=pjpg&exif=1&iptc=1',
        width: 467,
        height: 700,
      },
    },
  ],
  fetching: false,
}

export default (state = DEFAULT_STATE, action) => state
