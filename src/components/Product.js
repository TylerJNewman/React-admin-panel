import React, { useReducer, useEffect, useState } from 'react'
import Axios from '../Axios'
import { Table, Container, Button } from 'react-bootstrap'
import { Image, Info, Trash2, Edit } from 'react-feather'
import ProductImage from './ProductImages'
import './product.css'
import Swal from 'sweetalert2'
import { useHistory } from 'react-router-dom'
import { useToasts } from 'react-toast-notifications'

const productReducer = (state, action) => {
	switch (action.type) {
		case 'SHOW_PRODUCT':
			return action.payload
		case 'REMOVE_PRODUCT':
			return state.filter((key) => key.name !== action.payload)
		default:
			return state
	}
}

/**
 * Product Component
 */
const Product = () => {
	const [product, dispatch] = useReducer(productReducer, [])
	const [show, setShow] = useState(false)
	const history = useHistory()
	const { addToast } = useToasts()
	let count = 0
	const [image, setImage] = useState([])

	const handleClose = () => setShow(false)
	const handleShow = () => setShow(true)

	const modalImages = (id) => {
		var index = product.findIndex((obj) => obj.id === id)
		if (index !== -1) {
			setImage(product[index].product_image)
		}

		handleShow()
	}

	const showProduct = async () => {
		const response = await Axios.get('/admin/showProduct')
		dispatch({
			type: 'SHOW_PRODUCT',
			payload: response.data.product
		})
	}

	const removeProduct = (name) => {
		Swal.fire({
			title: 'Are you sure?',
			text: `You want to delete ${name}`,
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Yes, delete it!',
			cancelButtonText: 'No, keep it'
		}).then(async (result) => {
			if (result.value) {
				const response = await Axios.delete(`/admin/productRemove/${name}`).catch((error) => {
					if (error.response) {
						addToast("Something's Went Wrong!", {
							appearance: 'error',
							autoDismiss: true
						})
					}
				})
				if (response.data.name) {
					addToast('Product removed!', {
						appearance: 'warning',
						autoDismiss: true
					})
					dispatch({
						type: 'REMOVE_PRODUCT',
						payload: response.data.name
					})
				}
			}
		})
	}

	useEffect(() => {
		showProduct()
	}, [])

	const productImageModal = <ProductImage show={show} handleClose={handleClose} images={image} />

	return (
		<div>
			<Button variant="primary" onClick={() => history.push('/product/insert')}>
				Add Product
			</Button>
			<Container fluid>
				<Table striped bordered hover>
					<thead>
						<tr>
							<th>No.</th>
							<th>Name</th>
							<th>Description</th>
							<th>Category</th>
							<th>Brand</th>
							<th>Price</th>
							<th>Active</th>
							<th>Details</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{product.map((item) => {
							return (
								<tr key={item.id}>
									<td>{++count}</td>
									<td>{item.name}</td>
									<td>{item.product_description}</td>
									<td>{item.cat_id.name}</td>
									<td>{item.brand_id.name}</td>
									<td>{item.price}</td>
									<td className={item.isActive === true ? 'green' : 'red'}></td>
									<td>
										<Info style={{ cursor: 'pointer' }} />
										&nbsp;&nbsp;
										<Image
											color="purple"
											style={{ cursor: 'pointer' }}
											onClick={() => modalImages(item.id)}
										/>
									</td>
									<td>
										<Edit color="blue" style={{ cursor: 'pointer' }} />
										&nbsp;&nbsp;
										<Trash2
											color="red"
											style={{ cursor: 'pointer' }}
											onClick={() => removeProduct(item.name)}
										/>
									</td>
								</tr>
							)
						})}
					</tbody>
				</Table>
			</Container>
			{show && productImageModal}
		</div>
	)
}

export default Product
