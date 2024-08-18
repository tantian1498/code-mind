import { forwardRef, memo, useContext, useEffect, useImperativeHandle, useReducer, useRef, useState } from 'react'
import { MindContext } from './code-mind'
import clsx from 'clsx'
import { useSelectState } from '@/hooks/useSelectState'

interface Props {
	generateNextSibling: () => void
	generateChild: () => void
	deleteCurrent: () => void
	node: MindNode
}

const _EditableNode = forwardRef<any, Props>((props, ref) => {
	const { generateNextSibling, generateChild, deleteCurrent, node } = props
	const { maxWidth, minWidth, updateLayout } = useContext(MindContext)

	const innerRef = useRef<NodeElement>(null)
	const [value, setValue] = useState(node.value)
	const [editable, _setEditable] = useState(false)

	const setEditable = (bool: boolean) => {
		if (!bool && innerRef.current) {
			setValue(innerRef.current.innerHTML)
		}
		_setEditable(bool)
	}

	const [style, dispatchStyle] = useReducer(styleReducer, node.style || {})
	useEffect(() => {
		if (innerRef.current) {
			innerRef.current.reactStyle = style
			innerRef.current.dispatchStyle = dispatchStyle
		}
	}, [innerRef.current, style])

	useEffect(() => {
		node.value = value
	}, [value])

	useEffect(() => {
		if (node.isNew) {
			innerRef.current!.focus()
			const selection = window.getSelection()
			selection?.selectAllChildren(innerRef.current!)
			node.isNew = false
		}
	}, [node])

	const [height, setHeight] = useState(0)
	useEffect(() => {
		updateLayout()
	}, [height])

	useEffect(() => {
		const resizeObserver = new ResizeObserver(() => {
			setHeight(innerRef.current!.scrollHeight)
		})

		resizeObserver.observe(innerRef.current!)

		return () => {
			resizeObserver.disconnect()
		}
	}, [innerRef.current])

	useImperativeHandle(
		ref,
		() => ({
			getContent() {
				return innerRef.current!.innerHTML
			},
			getStyle() {
				return style
			}
		}),
		[style]
	)

	const { current } = useSelectState()

	return (
		<div
			dangerouslySetInnerHTML={{ __html: value }}
			tabIndex={0}
			ref={innerRef}
			onDoubleClick={() => setEditable(true)}
			onBlur={() => setEditable(false)}
			onKeyDown={event => {
				if (event.key === 'Enter') {
					if (editable) {
						if (!event.shiftKey) {
							setEditable(false)
						}
					} else {
						event.preventDefault()
						generateNextSibling()
					}
				} else if (event.key === 'Tab') {
					if (editable) {
						event.preventDefault()
						setEditable(false)
					} else {
						event.preventDefault()
						generateChild()
					}
				} else if (event.key === 'Escape') {
					setEditable(false)
				} else if (
					(!editable || innerRef.current!.innerHTML === '') &&
					(event.key === 'Delete' || event.key === 'Backspace')
				) {
					deleteCurrent()
				} else if (
					!editable &&
					!/^.{2,}/.test(event.key) &&
					!event.shiftKey &&
					!event.altKey &&
					!event.metaKey &&
					!event.ctrlKey
				) {
					setEditable(true)
				}
			}}
			contentEditable={editable}
			className={clsx('mind-node', current && current === innerRef.current && 'selected')}
			id='mind-node'
			style={{ maxWidth, minWidth, ...style }}
		/>
	)
})

const EditableNode = memo(_EditableNode)

export default EditableNode

const styleReducer: React.Reducer<
	React.CSSProperties,
	{ type: 'setWidth' | 'setMinWidth' | 'setMaxWidth' | 'setHeight' | 'setBackgroundColor'; payload: string | number }
> = (style, action) => {
	switch (action.type) {
		case 'setWidth':
			return { ...style, width: action.payload }
		case 'setMinWidth':
			return { ...style, minWidth: action.payload }
		case 'setMaxWidth':
			return { ...style, maxWidth: action.payload }
		case 'setHeight':
			return { ...style, height: action.payload }
		case 'setBackgroundColor':
			return { ...style, backgroundColor: String(action.payload) }
		default:
			throw Error('Unknown action: ' + action.type)
	}
}
