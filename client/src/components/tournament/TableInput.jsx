import {useForm, Controller} from "react-hook-form";

export default function TableInput(){
    const { 
        control,
        handleSubmit,
        setValue,
        formState: { errors }
    } = useForm();

    const onSubmit = (data) => {
        console.log('Submitted data:', data);
        // Handle the submission logic, e.g., update the scores in your state or make an API call.
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Controller
                name="scores"
                control={control}
                defaultValue={[]}
                render={({ field }) => (
                    <td>
                    {/* Editable row in the table */}
                    <input
                        type="number"
                        {...field}
                        onChange={(e) => {
                        setValue('scores', [parseInt(e.target.value, 10)]);
                        }}
                    />
                    {errors.scores && <span>{errors.scores.message}</span>}
                    </td>
                )}
            />
            <button type="submit">Submit</button>
        </form>
        );
}