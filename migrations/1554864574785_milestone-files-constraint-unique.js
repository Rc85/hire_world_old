exports.up = pgm => {
    pgm.addConstraint('milestone_files', 'unique_file_rows', {
        unique: ['file_milestone_id', 'filename']
    })
}