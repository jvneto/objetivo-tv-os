import { Alerts } from '../class/__instance_alerts.js';
import { Application } from '../class/__instance_application.js';
import { Connection } from '../class/__instance_connection.js';
import { Exception } from '../class/__instance_exception.js';


const startPipeLine = (data) => {
    try {
        // Init routines
    } catch (error) {
        new Exception().create({
            status: 512,
            error_name: error.name,
            error_message: error.message,
        });
    }
};

window.onload = () => {
    (async () => {
        //    Async Routines
    })();
};
