import md5 from 'md5'

export default (params = {}) => {
  return md5(JSON.stringify(params))
}
