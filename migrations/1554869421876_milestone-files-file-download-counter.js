exports.up = pgm => {
    pgm.addColumns('milestone_files', {
        file_download_counter: {
            type: 'int',
            default: 0
        }
    })
}