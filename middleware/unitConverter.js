

const unitConvert = (un,val) => {
    // Check if input is empty
    if(!un?.length){
        res.status(400).json({ message: 'No unit input found' });
    } else {
        // Convert unit string to gram and convert value to equivalent grams
        // if(un === 'kg'){
        //     val = val * 1000;
        //     un = 'g';
        // } else if(un === 'lb'){
        //     val = val * 453.592;
        //     un = 'g';
        // } else if(un === 'oz'){
        //     val = val * 28.3495;
        //     un = 'g';
        // } else if(un === 'pinch'){
        //     val = val * 0.36;
        //     un = 'g';
        // } else if (un === 'l'){
        //     val = val * 1000;
        //     un = 'ml';
        // } else if (un === 'tray'){
        //     val = val * 30;
        //     un = 'ea';
        // }

        switch (un) {
            case 'kg':
                val = val * 1000;
                un = 'g';
                break;
            case 'lb':
                val = val * 453.592;
                un = 'g';
                break;
            case 'oz':
                val = val * 28.3495;
                un = 'g';
                break;
            case 'pinch':
                val = val * 0.36;
                un = 'g';
                break;
            case 'l':
                val = val * 1000;
                un = 'ml';
                break;
            case 'tray':
                val = val * 30;
                un = 'ea';
                break;
            default:
                break;
        }
    }
    return un, val; 
}

module.exports = { unitConvert };