import React from 'react';
import {Code} from '@nyris/nyris-api';

interface Props {
    codes: Code[]
}
const Codes = ({codes}: Props) =>
    <>
        <div className="codes" style={{textAlign: 'center'}}>
            {codes.length > 0 && <span style={{fontSize: '0.8em'}}>Codes<br/> </span> }
            {codes.map((c, i) =>
                <small key={i} title={c.type}>
                    {c.value}
                </small>)}
        </div>
    </>
;


export default Codes;
