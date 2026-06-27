import React from 'react';

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export default function Logo({ size = 100, className = '', ...props }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={`select-none ${className}`}
      id="doce_aroma_stamp_logo"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <defs>
        {/* Fonts and clip paths */}
        <linearGradient id="sage-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E3EAE0" />
          <stop offset="100%" stopColor="#BAC7B8" />
        </linearGradient>
        <linearGradient id="pink-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FBFBF9" />
          <stop offset="100%" stopColor="#E9DCD0" />
        </linearGradient>

        {/* Hidden curved paths for the text to follow */}
        {/* Top-arch path (left to right, radius ~79) */}
        <path
          id="topTextPath"
          d="M 23,100 A 77,77 0 0,1 177,100"
          fill="none"
          stroke="none"
        />
        {/* Bottom-arch path (right to left, radius ~79) */}
        <path
          id="bottomTextPath"
          d="M 177,100 A 77,77 0 0,1 23,100"
          fill="none"
          stroke="none"
        />
      </defs>

      {/* 1. Outer Ring (Sage/Olive light background) */}
      <circle cx="100" cy="100" r="97" fill="url(#sage-grad)" stroke="#191D1A" strokeWidth="1.2" />

      {/* 2. Inner Circle (Pastel Pink background) */}
      <circle cx="100" cy="100" r="65" fill="url(#pink-grad)" stroke="#191D1A" strokeWidth="1.2" />

      {/* 3. Horizontal boundary lines connecting inner & outer rings */}
      <line x1="3" y1="100" x2="35" y2="100" stroke="#191D1A" strokeWidth="1.2" />
      <line x1="165" y1="100" x2="197" y2="100" stroke="#191D1A" strokeWidth="1.2" />

      {/* 4. Curved Texts in Serif Playfair */}
      <text
        fontFamily="'Playfair Display', Georgia, serif"
        fontSize="17.5"
        fontWeight="300"
        fill="#191D1A"
        letterSpacing="2.5"
      >
        <textPath href="#topTextPath" startOffset="50%" textAnchor="middle">
          DOCE AROMA
        </textPath>
      </text>

      <text
        fontFamily="'Playfair Display', Georgia, serif"
        fontSize="10.8"
        fontWeight="300"
        fill="#191D1A"
        letterSpacing="2.2"
      >
        <textPath href="#bottomTextPath" startOffset="50%" textAnchor="middle">
          SABONETES ARTESANAIS
        </textPath>
      </text>

      {/* 5. Center Illustration */}
      <g id="center-illustration" className="opacity-90">
        
        {/* Left framing branch */}
        <path
          d="M 39,94 C 36,110 40,123 52,136 C 54,138 56,139 58,138 C 59,136 59,134 57,132 C 47,121 44,110 46,96 C 47,94 45,92 43,92 C 41,92 40,93 39,94 Z"
          fill="#2E332B"
        />
        {/* Left branch leaves/buds */}
        <path d="M 39,94 C 35,93 32,95 33,98 C 34,101 37,101 39,98 Z" fill="#2E332B" />
        <path d="M 36,105 C 32,106 31,110 33,113 C 35,115 38,112 37,109 Z" fill="#2E332B" />
        <path d="M 40,118 C 36,120 37,125 39,127 C 42,129 44,125 42,121 Z" fill="#2E332B" />
        <path d="M 48,128 C 45,131 47,136 50,137 C 53,138 54,133 51,130 Z" fill="#2E332B" />

        {/* Right framing branch */}
        <path
          d="M 161,94 C 164,110 160,123 148,136 C 146,138 144,139 142,138 C 141,136 141,134 143,132 C 153,121 156,110 154,96 C 153,94 155,92 157,92 C 159,92 160,93 161,94 Z"
          fill="#2E332B"
        />
        {/* Right branch leaves/buds */}
        <path d="M 161,94 C 165,93 168,95 167,98 C 166,101 163,101 161,98 Z" fill="#2E332B" />
        <path d="M 164,105 C 168,106 169,110 167,113 C 165,115 162,112 163,109 Z" fill="#2E332B" />
        <path d="M 160,118 C 164,120 163,125 161,127 C 158,129 156,125 158,121 Z" fill="#2E332B" />
        <path d="M 152,128 C 155,131 153,136 150,137 C 147,138 146,133 149,130 Z" fill="#2E332B" />


        {/* MIDDLE LAVENDER BLOOM STALK (Slightly taller) */}
        {/* Stem */}
        <path
          d="M 100,162 C 99.5,140 99.5,120 100,90 C 100.2,74 100.8,68 100,60"
          fill="none"
          stroke="#2E332B"
          strokeWidth="1.1"
          strokeLinecap="round"
        />
        {/* Lavender leaves at bottom */}
        <path d="M 100,140 C 95,136 93,124 95,116 C 96,116 97,118 97,122 C 96,128 98,134 100,138 Z" fill="#2E332B" />
        <path d="M 100,140 C 105,136 107,124 105,116 C 104,116 103,118 103,122 C 104,128 102,134 100,138 Z" fill="#2E332B" />
        <path d="M 100,148 C 92,146 88,136 90,126 C 91.5,126 92.5,129 92.5,132 C 91.5,138 95,142 100,145 Z" fill="#2E332B" />
        <path d="M 100,148 C 108,146 112,136 110,126 C 108.5,126 107.5,129 107.5,132 C 108.5,138 105,142 100,145 Z" fill="#2E332B" />
        
        {/* Middle stalk buds (Stacked vertically along the top-middle) */}
        {/* Lowest bunch */}
        <ellipse cx="97" cy="85" rx="2.5" ry="4" transform="rotate(-30 97 85)" fill="#2E332B" />
        <ellipse cx="103" cy="85" rx="2.5" ry="4" transform="rotate(30 103 85)" fill="#2E332B" />
        <circle cx="100" cy="83.5" r="2.2" fill="#2E332B" />
        
        <ellipse cx="96.5" cy="78" rx="2.4" ry="4" transform="rotate(-35 96.5 78)" fill="#2E332B" />
        <ellipse cx="103.5" cy="78" rx="2.4" ry="4" transform="rotate(35 103.5 78)" fill="#2E332B" />
        <circle cx="100" cy="76.5" r="2.1" fill="#2E332B" />

        <ellipse cx="96.8" cy="71" rx="2.3" ry="3.8" transform="rotate(-25 96.8 71)" fill="#2E332B" />
        <ellipse cx="103.2" cy="71" rx="2.3" ry="3.8" transform="rotate(25 103.2 71)" fill="#2E332B" />
        <circle cx="100" cy="69.5" r="2" fill="#2E332B" />

        <ellipse cx="97" cy="64" rx="2.1" ry="3.5" transform="rotate(-20 97 64)" fill="#2E332B" />
        <ellipse cx="103" cy="64" rx="2.1" ry="3.5" transform="rotate(20 103 64)" fill="#2E332B" />
        <circle cx="100" cy="62.5" r="1.8" fill="#2E332B" />

        {/* Tip of lavender */}
        <circle cx="100" cy="57" r="1.6" fill="#2E332B" />
        <circle cx="100" cy="53.5" r="1.2" fill="#2E332B" />


        {/* LEFT LAVENDER BLOOM STALK (Leaning left) */}
        <g transform="translate(100, 160) rotate(-15) translate(-100, -160)">
          {/* Stem */}
          <path
            d="M 98,162 C 98.3,142 98.8,122 100,92 C 100.2,77 100.4,70 100,62"
            fill="none"
            stroke="#2E332B"
            strokeWidth="1.1"
            strokeLinecap="round"
          />
          {/* Leaves */}
          <path d="M 100,136 C 96,132 94,121 95,114 C 96,114 97,116 97,119 C 96,125 98,130 100,134 Z" fill="#2E332B" />
          <path d="M 100,136 C 104,132 106,121 105,114 C 104,114 103,116 103,119 C 104,125 102,130 100,134 Z" fill="#2E332B" />
          
          {/* Buds */}
          <ellipse cx="97" cy="85" rx="2.3" ry="3.8" transform="rotate(-30 97 85)" fill="#2E332B" />
          <ellipse cx="103" cy="85" rx="2.3" ry="3.8" transform="rotate(30 103 85)" fill="#2E332B" />
          <circle cx="100" cy="83.5" r="2.1" fill="#2E332B" />
          
          <ellipse cx="96.5" cy="78" rx="2.2" ry="3.8" transform="rotate(-35 96.5 78)" fill="#2E332B" />
          <ellipse cx="103.5" cy="78" rx="2.2" ry="3.8" transform="rotate(35 103.5 78)" fill="#2E332B" />
          <circle cx="100" cy="76.5" r="2" fill="#2E332B" />

          <ellipse cx="96.8" cy="71" rx="2.1" ry="3.6" transform="rotate(-25 96.8 71)" fill="#2E332B" />
          <ellipse cx="103.2" cy="71" rx="2.1" ry="3.6" transform="rotate(25 103.2 71)" fill="#2E332B" />
          <circle cx="100" cy="69.5" r="1.9" fill="#2E332B" />

          <ellipse cx="97" cy="64" rx="1.9" ry="3.3" transform="rotate(-20 97 64)" fill="#2E332B" />
          <ellipse cx="103" cy="64" rx="1.9" ry="3.3" transform="rotate(20 103 64)" fill="#2E332B" />
          <circle cx="100" cy="62.5" r="1.7" fill="#2E332B" />

          <circle cx="100" cy="57" r="1.5" fill="#2E332B" />
          <circle cx="100" cy="53.5" r="1.1" fill="#2E332B" />
        </g>


        {/* RIGHT LAVENDER BLOOM STALK (Leaning right) */}
        <g transform="translate(100, 160) rotate(15) translate(-100, -160)">
          {/* Stem */}
          <path
            d="M 102,162 C 101.7,142 101.2,122 100,92 C 99.8,77 99.6,70 100,62"
            fill="none"
            stroke="#2E332B"
            strokeWidth="1.1"
            strokeLinecap="round"
          />
          {/* Leaves */}
          <path d="M 100,136 C 96,132 94,121 95,114 C 96,114 97,116 97,119 C 96,125 98,130 100,134 Z" fill="#2E332B" />
          <path d="M 100,136 C 104,132 106,121 105,114 C 104,114 103,116 103,119 C 104,125 102,130 100,134 Z" fill="#2E332B" />
          
          {/* Buds */}
          <ellipse cx="97" cy="85" rx="2.3" ry="3.8" transform="rotate(-30 97 85)" fill="#2E332B" />
          <ellipse cx="103" cy="85" rx="2.3" ry="3.8" transform="rotate(30 103 85)" fill="#2E332B" />
          <circle cx="100" cy="83.5" r="2.1" fill="#2E332B" />
          
          <ellipse cx="96.5" cy="78" rx="2.2" ry="3.8" transform="rotate(-35 96.5 78)" fill="#2E332B" />
          <ellipse cx="103.5" cy="78" rx="2.2" ry="3.8" transform="rotate(35 103.5 78)" fill="#2E332B" />
          <circle cx="100" cy="76.5" r="2" fill="#2E332B" />

          <ellipse cx="96.8" cy="71" rx="2.1" ry="3.6" transform="rotate(-25 96.8 71)" fill="#2E332B" />
          <ellipse cx="103.2" cy="71" rx="2.1" ry="3.6" transform="rotate(25 103.2 71)" fill="#2E332B" />
          <circle cx="100" cy="69.5" r="1.9" fill="#2E332B" />

          <ellipse cx="97" cy="64" rx="1.9" ry="3.3" transform="rotate(-20 97 64)" fill="#2E332B" />
          <ellipse cx="103" cy="64" rx="1.9" ry="3.3" transform="rotate(20 103 64)" fill="#2E332B" />
          <circle cx="100" cy="62.5" r="1.7" fill="#2E332B" />

          <circle cx="100" cy="57" r="1.5" fill="#2E332B" />
          <circle cx="100" cy="53.5" r="1.1" fill="#2E332B" />
        </g>

        
        {/* BUTTERFLY LEFT */}
        <g id="butterfly-left" transform="translate(77, 85) scale(0.6)">
          {/* Left Wing */}
          <path
            d="M 0,0 C -5,-3 -12,-1 -11,4 C -10,8 -5,7 0,3 Z"
            fill="none"
            stroke="#2E332B"
            strokeWidth="1.1"
          />
          <path
            d="M 0,1 Q -7,5 -6,9 Q -4,11 0,3 Z"
            fill="none"
            stroke="#2E332B"
            strokeWidth="0.9"
          />
          {/* Antenna */}
          <path d="M 0,-1 Q -2,-4 -5,-4" fill="none" stroke="#2E332B" strokeWidth="0.7" />
          {/* Tiny details inside wing */}
          <line x1="-3" y1="1" x2="-8" y2="1" stroke="#2E332B" strokeWidth="0.6" />
          <line x1="-2" y1="3" x2="-6" y2="4" stroke="#2E332B" strokeWidth="0.6" />
        </g>


        {/* BUTTERFLY RIGHT */}
        <g id="butterfly-right" transform="translate(123, 85) scale(0.6) scale(-1, 1)">
          {/* Right Wing (horizontally flipped wing via scale(-1, 1)) */}
          <path
            d="M 0,0 C -5,-3 -12,-1 -11,4 C -10,8 -5,7 0,3 Z"
            fill="none"
            stroke="#2E332B"
            strokeWidth="1.1"
          />
          <path
            d="M 0,1 Q -7,5 -6,9 Q -4,11 0,3 Z"
            fill="none"
            stroke="#2E332B"
            strokeWidth="0.9"
          />
          {/* Antenna */}
          <path d="M 0,-1 Q -2,-4 -5,-4" fill="none" stroke="#2E332B" strokeWidth="0.7" />
          {/* Tiny details inside wing */}
          <line x1="-3" y1="1" x2="-8" y2="1" stroke="#2E332B" strokeWidth="0.6" />
          <line x1="-2" y1="3" x2="-6" y2="4" stroke="#2E332B" strokeWidth="0.6" />
        </g>

      </g>
    </svg>
  );
}
