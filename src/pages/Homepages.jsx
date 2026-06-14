const Homepages = () => {
    return (
        <section className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center max-w-4xl px-6">
                <h1 className="text-5xl font-bold text-gray-900 mb-6">
                    Learn Smarter with BrainXNext
                </h1>

                <p className="text-lg text-gray-600 mb-8">
                    Explore premium courses, read insightful articles,
                    and accelerate your learning journey with expert-led content.
                </p>

                <div className="flex justify-center gap-4">
                    <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
                        Explore Courses
                    </button>

                    <button className="border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-100">
                        Read Articles
                    </button>
                </div>
            </div>
        </section>
    );
};

export default Homepages;