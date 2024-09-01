/***
 * Documentation logic
 */

const resizeLayout = () => {
    const docNav = document.querySelector('#navbar')
    const docMain = document.querySelector('.documentation')
    
    const docNavWidth = docNav.offsetWidth
    
    docMain.style.marginLeft = `${docNavWidth}px`
    console.log(docNavWidth)
}

resizeLayout()

window.addEventListener('resize', () => {
    resizeLayout()
})