import { useContext, useEffect, useState } from 'react'
import clsx from 'clsx'
import { MindContext } from './code-mind'
import { containerState } from '@/share'
import { amendDistance } from '@/utils'

interface Props {
	parentNode?: NodeRef
	childNode: NodeRef
	siblings?: MindNode[]
	type?: LineType
}

export default function MindEdge({ parentNode, childNode, siblings, type = 'bezier' }: Props) {
	const { distance, layoutFlag } = useContext(MindContext)

	const [height, setHeight] = useState(0)

	useEffect(() => {
		if (parentNode?.current && childNode.current) {
			const { top: pTop, height: pheight } = parentNode.current.getBoundingClientRect()
			const { top: cTop, height: cHeight } = childNode.current.getBoundingClientRect()

			let height = pTop - cTop + (pheight - cHeight) / 2
			height /= containerState.scale

			setHeight(height)
		}
	}, [siblings, layoutFlag])

	const h = Math.abs(height)

	const distance_amend = amendDistance(distance, siblings)

	if (parentNode?.current && childNode.current)
		if (h > 2) {
			return (
				<svg
					className={clsx(
						'absolute left-0 top-1/2 z-[-1] -translate-x-full text-edge ',
						height < 0 && '-translate-y-full -scale-y-100'
					)}
					stroke='currentColor'
					viewBox={`0 0 ${distance_amend} ${h}`}
					style={{ width: distance_amend, height: h }}
					strokeWidth='2'
					fill='none'>
					<path d={`M0 ${h} C${distance_amend / 5} ${h} ${(distance_amend * 4) / 5} 0  ${distance_amend} 0`} />
				</svg>
			)
		} else
		// 如果深度小于2 绘制简单的直线
			return (
				<div
					className='absolute left-0 top-1/2 z-[-1] -translate-x-full border-t-2 border-edge'
					style={{ width: distance_amend }}
				/>
			)

	return null
}
