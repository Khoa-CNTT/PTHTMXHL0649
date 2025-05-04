const SplashScreen = () => {
  return (
    <div className="w-full h-screen bg-white dark:bg-gray-900 flex flex-col justify-center items-center">
      <span className="font-bold text-3xl text-black dark:text-white">
        LinkVerse Admin
      </span>
      <div className="absolute bottom-10 text-gray-500 text-sm flex flex-col items-center">
        <span>from</span>
        <span className="text-black dark:text-white font-semibold">
          LinkVerse
        </span>
      </div>
    </div>
  );
};

export default SplashScreen;
