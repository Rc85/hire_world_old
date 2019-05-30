exports.up = pgm => {
    pgm.renameColumn('jobs', 'milestones_created_date', 'contract_created_date'),
    pgm.renameColumn('jobs', 'milestones_modified_date', 'contract_modified_date')
}