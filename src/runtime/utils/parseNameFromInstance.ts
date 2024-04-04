import { getCurrentInstance } from '#imports'

const parseNameFromInstance = (event:string) => {
	const instance = getCurrentInstance()
	const regex = /.*(?:components|pages)\/|\.vue$|\/index.vue$/g
	const raw = instance?.type?.__file?.replace(regex, "")
	const _component = raw ? raw?.replaceAll('/',':') : instance?.uid?.toString() || event

	return _component
}

export const getUid = (event:string, component?:string) => {
  return component || parseNameFromInstance(event)
}
