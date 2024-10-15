function Spinner() {
  return (
    <svg
      className="animate-spin"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 1.43099e-07C18.6274 2.2213e-07 24 5.37258 24 12C24 18.6274 18.6274 24 12 24C5.37258 24 6.40674e-08 18.6274 1.43099e-07 12C2.2213e-07 5.37258 5.37258 6.40674e-08 12 1.43099e-07ZM12 20.04C16.4404 20.04 20.04 16.4404 20.04 12C20.04 7.55963 16.4404 3.96 12 3.96C7.55963 3.96 3.96 7.55963 3.96 12C3.96 16.4404 7.55963 20.04 12 20.04Z"
        fill="url(#paint0_angular_153_1604)"
      />

      <defs>
        <radialGradient
          id="paint0_angular_153_1604"
          cx="0"
          cy="0"
          r="1.25"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(36 36) scale(36)"
        >
          <stop stopColor="#15ffab" />
          <stop offset="1" stopColor="#14D0F9" stopOpacity="0.4" />
        </radialGradient>
      </defs>
    </svg>
  )
}
export default Spinner
