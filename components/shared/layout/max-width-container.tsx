import React from 'react';

interface MaxWidthContainerProps {
	children: React.ReactNode;
	className?: string;
}

const MaxWidthContainer: React.FC<MaxWidthContainerProps> = ({
	children,
	className = '',
}) => {
	return (
		<div
			className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>
			{children}
		</div>
	);
};

export default MaxWidthContainer;
