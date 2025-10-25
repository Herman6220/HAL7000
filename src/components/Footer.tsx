


const Footer = () => {
  return (
    <div className="w-full min-h-80 max-h-120 p-4 flex flex-col items-center justify-end">
        <div className="w-full h-60 flex items-center justify-center">
        <h1 className="md:text-9xl text-7xl font-black text-blue-900/80"
            style={{maskImage: "linear-gradient(to bottom, black, transparent)"}}
        >HAL <span className="font-extralight">7000</span></h1>
        </div>
        <p className="align-bottom text-xs text-muted-foreground font-extralight mt-2">developed by Herman ©</p>
    </div>
  )
}

export default Footer