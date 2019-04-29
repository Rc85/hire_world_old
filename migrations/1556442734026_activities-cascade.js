exports.up = pgm => {
    pgm.dropConstraint('activities', 'activities_activity_user_fkey'),
    pgm.addConstraint('activities', 'activities_activity_user_fkey', {
        foreignKeys: {
            columns: 'activity_user',
            references: 'users (username)',
            onDelete: 'cascade',
            onUpdate: 'cascade'
        }
    })
}