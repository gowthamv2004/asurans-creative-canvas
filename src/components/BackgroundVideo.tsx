const BackgroundVideo = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Video background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-30"
        poster=""
      >
        <source
          src="https://assets.mixkit.co/videos/preview/mixkit-abstract-technology-network-connections-27809-large.mp4"
          type="video/mp4"
        />
      </video>
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
      
      {/* Animated glow effects */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-glow-primary/20 rounded-full blur-[120px] animate-float pointer-events-none" />
      <div 
        className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-glow-accent/20 rounded-full blur-[100px] animate-float pointer-events-none" 
        style={{ animationDelay: "-3s" }} 
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-glow-warm/10 rounded-full blur-[150px] pointer-events-none" />
    </div>
  );
};

export default BackgroundVideo;
