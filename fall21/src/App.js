//Table of Contents, Chapters (100. General)
//Display the selected chapter beside the Table of Contents, containing all rules in that chapter (100.2a)
//Filter text field

import React, { useState, useEffect } from 'react'
import rulesService from './services/rules'

const App = () => {
    const [rules, setRules] = useState([])
    //const [showAll, setShowAll] = useState(true)

    useEffect(() => {
        console.log('effect')
        rulesService.getRules()
            .then(response => {
                console.log('promise fulfilled')
                console.log(response)
                setRules(response.data)
            })
    }, [])
    console.log('render', rules.length, 'rules')

    return (
        <div>
            <p>{rules}</p>
        </div>
    )
}

export default App