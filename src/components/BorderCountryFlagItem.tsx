import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { BorderCountryFilterType } from './BorderCountryFilter';

interface BorderCountryFlagItemProps {
	countryFilter: BorderCountryFilterType;
	removeBorderCountryFilter: (cca3: string) => void;
	isFadingOut: boolean;
}

function BorderCountryFlagItem({ countryFilter, removeBorderCountryFilter, isFadingOut }: BorderCountryFlagItemProps) {
	const flagContainerRef = useRef<HTMLDivElement>(null);
	const tooltipRef = useRef<HTMLSpanElement>(null);

	const [tooltipStyles, setTooltipStyles] = useState<React.CSSProperties>({});
	const [cursorCoords, setCursorCoords] = useState<{ x: number; y: number } | null>(null);

	const updateTooltipPosition = useCallback(() => {
		if (!tooltipRef.current || !flagContainerRef.current || !cursorCoords) {
			return;
		}

		const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

		const tooltipRect = tooltipRef.current.getBoundingClientRect();
		const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
		const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

		const scrollY = window.scrollY || window.pageYOffset;

		// console.log(scrollY);

		const cursorX = cursorCoords.x;
		const cursorY = cursorCoords.y;

		const buffer = 10;
		const offsetX = (tooltipRect.width / 3);
		const offsetY = 25;

		let toolTipLeft = cursorX + offsetX;
		let toolTipTop = cursorY + offsetY;

		if (isTouchDevice) {
			toolTipTop += scrollY;
		}

		// Ensure tooltip doesn't go off the right edge of the viewport
		if (toolTipLeft + (tooltipRect.width / 2) + buffer > viewportWidth - buffer) {
			toolTipLeft = cursorX - offsetX; // Position to the left of the cursor
		}

		// Ensure tooltip doesn't go off the left edge of the viewport
		if (toolTipLeft < buffer) {
			toolTipLeft = cursorX + offsetX;
		}

		// Ensure tooltip doesn't go off the bottom edge of the viewport
		if (toolTipTop + tooltipRect.height + buffer > viewportHeight + scrollY) {
			toolTipTop = cursorY - offsetY - tooltipRect.height;
		}

		setTooltipStyles({
			left: `${toolTipLeft}px`,
			top: `${toolTipTop}px`,
		});

	}, [cursorCoords]);

	useEffect(() => {
		const flagContainer = flagContainerRef.current;
		const tooltip = tooltipRef.current;

		if (!flagContainer || !tooltip) {
			return;
		}

		const handleMouseMove = (event: MouseEvent) => {
			setCursorCoords({ x: event.clientX, y: event.clientY });
		};

		const handleMouseEnter = (event: MouseEvent) => {
			flagContainer.addEventListener('mousemove', handleMouseMove);
			tooltip.style.visibility = 'visible';
			tooltip.style.opacity = '1';
			// Set initial position immediately on mouse enter
			setCursorCoords({ x: event.clientX, y: event.clientY });
		};

		const handleMouseLeave = () => {
			flagContainer.removeEventListener('mousemove', handleMouseMove);
			setCursorCoords(null);
			tooltip.style.visibility = 'hidden';
			tooltip.style.opacity = '0';
			setTooltipStyles({});
		};

		flagContainer.addEventListener('mouseenter', handleMouseEnter);
		flagContainer.addEventListener('mouseleave', handleMouseLeave);

		return () => {
			flagContainer.removeEventListener('mouseenter', handleMouseEnter);
			flagContainer.removeEventListener('mouseleave', handleMouseLeave);
			flagContainer.removeEventListener('mousemove', handleMouseMove); // Ensure cleanup
		};
	}, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

	useEffect(() => {
		// Only update tooltip position if cursorCoords are present
		if (cursorCoords) {
			updateTooltipPosition();
		}
	}, [cursorCoords, updateTooltipPosition]);


	return (
		<div
			ref={flagContainerRef}
			className={`border-country-flag-container ${isFadingOut ? 'fade-out' : ''}`}
		>
			<span className="border-country-flag-close-button-overlay" />
			<span
				className="tooltip-text"
				ref={tooltipRef}
				style={tooltipStyles}
			>
				{countryFilter.name}
			</span>
			<span className="border-country-flag-close-button" onClick={() => removeBorderCountryFilter(countryFilter.cca3)}>
				&#x2716;
			</span>
			{countryFilter.isLoadingFlag ? (
				<div className="border-country-flag-container border-country-flag-placeholder" />
			) : countryFilter.flag ? (
				<img className="border-country-flag" src={countryFilter.flag} alt={`${countryFilter.name} flag`} />
			) : (
				<div className="border-country-flag-container border-country-flag-placeholder" />
			)}
		</div>
	);
}

export default BorderCountryFlagItem;