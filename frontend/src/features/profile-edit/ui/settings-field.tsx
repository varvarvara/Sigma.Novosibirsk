type SettingsFieldProps = {
    id: string;
    label: string;
    value: string;
    isEditing: boolean;
    isDisabled: boolean;
    type?: string;
    placeholder?: string;
    onChange: (value: string) => void;
};

export function SettingsField({
    id,
    label,
    value,
    isEditing,
    isDisabled,
    type = "text",
    placeholder,
    onChange,
}: SettingsFieldProps) {
    return (
        <div className="profile-settings-field">
            <label htmlFor={id}>{label}</label>
            <input
                id={id}
                className="profile-settings-control"
                type={type}
                value={value}
                readOnly={!isEditing}
                disabled={isDisabled}
                placeholder={placeholder}
                onChange={(event) => onChange(event.target.value)}
            />
        </div>
    );
}
