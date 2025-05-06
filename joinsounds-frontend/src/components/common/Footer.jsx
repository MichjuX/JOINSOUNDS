import React from 'react'

const FooterComponent = () => {
    return (
        <div>
            <footer className='footer'>
                <span>JoinSounds | All Right Reserved &copy; {new Date().getFullYear()} </span> <br />
                <span>Font "Sansation" used on this website is licensed under the SIL Open Font License.</span>
            </footer>
        </div>
    )
}

export default FooterComponent