import 'bootstrap/dist/css/bootstrap.min.css';

export default function HomeForm() {
    return (
        <>
            {/* music_area */}
            <div className="music_area py-5 text-white">
                <div className="container">
                    <div className="row justify-content-center align-items-center">
                        <div className="col-lg-10">
                            <div className="row align-items-center">
                                <div className="col-md-9">
                                    <div className="d-flex align-items-center gap-4">
                                        <img src="img/music_man/1.png" alt="" className="img-fluid rounded" style={{ width: 100 }} />
                                        <div>
                                            <h4>Frando Kally</h4>
                                            <p className="mb-1 text-muted">10 November, 2019</p>
                                            <audio controls className="w-100">
                                                <source src="https://www.w3schools.com/html/horse.mp3" />
                                            </audio>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3 text-md-end mt-3 mt-md-0">
                                    <a href="/public" className="btn btn-outline-light">Buy Album</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* about_area */}
            <div className="about_area py-5 text-white">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-md-6 mb-4 mb-md-0">
                            <img src="img/about/about_1.png" alt="" className="img-fluid rounded" />
                        </div>
                        <div className="col-md-6">
                            <h3>Jack Kalib</h3>
                            <p className="text-light">Esteem spirit temper too say adieus who direct esteem...</p>
                            <img src="img/about/signature.png" alt="" style={{ maxWidth: 150 }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* youtube_video_area */}
            <div className="youtube_video_area text-white py-5">
                <div className="container-fluid">
                    <div className="row g-3">
                        {[1, 2, 3, 4].map(num => (
                            <div className="col-md-6 col-lg-3" key={num}>
                                <div className="card bg-secondary text-white h-100">
                                    <img src={`img/video/${num}.png`} className="card-img-top" alt="" />
                                    <div className="card-body d-flex flex-column">
                                        <h5 className="card-title">Shadows of My Dream</h5>
                                        <p className="card-text text-muted">New York Show-2018</p>
                                        <a href="https://www.youtube.com/watch?v=Hzmp3z6deF8" className="btn btn-outline-light mt-auto">
                                            <i className="fa fa-play me-2"></i> Watch Video
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* music_gallery */}
            <div className="music_gallery bg-black py-5 text-white">
                <div className="container">
                    <div className="text-center mb-5">
                        <h3>Latest Tracks</h3>
                    </div>

                    {[1, 2, 3].map(num => (
                        <div key={num} className="row align-items-center justify-content-center mb-4">
                            <div className="col-lg-10">
                                <div className="row align-items-center">
                                    <div className="col-md-9">
                                        <div className="d-flex align-items-center gap-4">
                                            <img src={`img/music_man/${num}.png`} alt="" className="img-fluid rounded" style={{ width: 100 }} />
                                            <div>
                                                <h5>Frando Kally</h5>
                                                <p className="text-muted">10 November, 2019</p>
                                                <audio controls className="w-100">
                                                    <source src="https://www.w3schools.com/html/horse.mp3" />
                                                </audio>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-3 text-md-end mt-3 mt-md-0">
                                        <a href="/public" className="btn btn-outline-light">Buy Album</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* gallery_area */}
            <div className="gallery_area bg-dark py-5 text-white">
                <div className="container">
                    <div className="text-center mb-5">
                        <h3>Image Galleries</h3>
                    </div>
                    <div className="row g-4">
                        {[1, 2, 3].map((num, index) => (
                            <div key={num} className="col-md-4">
                                <div className="card bg-secondary">
                                    <img src={`img/gallery/${num}.png`} className="card-img-top" alt="" />
                                    <div className="card-body text-center">
                                        <a href={`img/gallery/${num}.png`} className="btn btn-outline-light">View Image</a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
